/**
 * Media Risk Scoring & Anomaly Detection Engine
 * Pure mathematical scoring based on extracted signal processing measurements.
 * Zero external AI models, zero random values, zero hallucinated claims.
 */

export const ANOMALY_LEVELS = {
  LOW: {
    label: 'LOW ANOMALY RISK',
    variant: 'safe',
    color: '#23845D',
    bgColor: '#E7F5EF',
    borderColor: '#B3E0CE',
    summary: 'Technical signal characteristics appear consistent with natural recording environments.'
  },
  MODERATE: {
    label: 'MODERATE ANOMALY RISK',
    variant: 'warning',
    color: '#C58A32',
    bgColor: '#FFF9E6',
    borderColor: '#FFE08A',
    summary: 'Minor technical irregularities detected (such as heavy compression, aggressive noise gating, or minor splicing).'
  },
  HIGH: {
    label: 'HIGH ANOMALY RISK',
    variant: 'warning',
    color: '#E06A26',
    bgColor: '#FFF1E8',
    borderColor: '#FFC8A8',
    summary: 'Notable anomalies detected across acoustic or temporal dimensions (e.g. pitch monotony, unnatural silence distribution, or frame jitter).'
  },
  VERY_HIGH: {
    label: 'VERY HIGH ANOMALY RISK',
    variant: 'danger',
    color: '#D45B61',
    bgColor: '#FDF2F2',
    borderColor: '#F8B4B4',
    summary: 'Multiple severe technical irregularities identified, suggesting potential synthesis, splicing, or heavy manipulation.'
  }
};

export function getRiskClassification(score) {
  if (score < 30) return ANOMALY_LEVELS.LOW;
  if (score < 60) return ANOMALY_LEVELS.MODERATE;
  if (score < 80) return ANOMALY_LEVELS.HIGH;
  return ANOMALY_LEVELS.VERY_HIGH;
}

/**
 * Evaluates Audio Authenticity Metrics and generates structured findings
 */
export function scoreAudioAuthenticity(metrics) {
  if (!metrics || metrics.status === 'insufficient_data') {
    return {
      isInsufficient: true,
      anomalyScore: null,
      classification: null,
      findings: [],
      summaryMessage: 'INSUFFICIENT DATA FOR RELIABLE ANALYSIS'
    };
  }

  let totalScore = 0;
  const findings = [];

  // 1. Silence & Ambient Noise Floor (Max 30 pts)
  // Check absolute digital silence (exact zeroes or sub -80dB)
  if (metrics.absoluteSilenceRatio > 15) {
    totalScore += 20;
    findings.push({
      category: 'Silence Analysis',
      severity: 'anomaly',
      title: 'Unnatural Absolute Digital Silence',
      metric: `${metrics.absoluteSilenceRatio}% zero-energy frames`,
      explanation: 'Microphone recordings almost always contain natural acoustic room reflections. Prolonged mathematical zero-energy frames indicate synthetic generation or spliced silence.'
    });
  } else if (metrics.absoluteSilenceRatio > 5) {
    totalScore += 10;
    findings.push({
      category: 'Silence Analysis',
      severity: 'attention',
      title: 'Elevated Zero-Energy Pauses',
      metric: `${metrics.absoluteSilenceRatio}% zero-energy frames`,
      explanation: 'Unusually quiet pauses detected, which may be caused by aggressive software noise-gating or digital cutting.'
    });
  } else {
    findings.push({
      category: 'Silence Analysis',
      severity: 'normal',
      title: 'Natural Ambient Room Noise Floor',
      metric: `${metrics.noiseFloorDb} dB noise floor`,
      explanation: 'Continuous natural acoustic presence observed throughout speech gaps, typical of physical microphone capture.'
    });
  }

  // Check rigid pause rhythm (TTS cadence)
  if (metrics.pauseDurationStdDev < 0.05 && metrics.pauseDurationMean > 0.15) {
    totalScore += 10;
    findings.push({
      category: 'Silence Distribution',
      severity: 'anomaly',
      title: 'Unnatural Pause Duration Regularity',
      metric: `σ = ${metrics.pauseDurationStdDev}s`,
      explanation: 'Human conversational pauses naturally vary widely in length. Extremely uniform pause durations are characteristic of synthetic text-to-speech cadence.'
    });
  }

  // 2. Pitch Dynamics & Intonation (Max 25 pts)
  if (metrics.meanPitch > 0) {
    if (metrics.pitchStdDev < 12 && metrics.duration > 2.0) {
      totalScore += 20;
      findings.push({
        category: 'Pitch Analysis',
        severity: 'anomaly',
        title: 'Robotic Pitch Monotony (Low Intonation)',
        metric: `Pitch σ = ${metrics.pitchStdDev} Hz`,
        explanation: 'Natural human vocalization displays expressive pitch variation across sentences. A standard deviation below 12 Hz indicates unnatural pitch flatness.'
      });
    } else if (metrics.pitchStdDev < 20 && metrics.duration > 2.0) {
      totalScore += 10;
      findings.push({
        category: 'Pitch Analysis',
        severity: 'attention',
        title: 'Constrained Pitch Variation',
        metric: `Pitch σ = ${metrics.pitchStdDev} Hz`,
        explanation: 'Vocal intonation is relatively flat. While this can occur in formal speech, synthetic voices frequently exhibit low dynamic pitch contours.'
      });
    } else {
      findings.push({
        category: 'Pitch Analysis',
        severity: 'normal',
        title: 'Expressive Pitch Dynamicity',
        metric: `Pitch σ = ${metrics.pitchStdDev} Hz (Mean: ${metrics.meanPitch} Hz)`,
        explanation: 'Natural human inflection curves and dynamic fundamental frequency shifts observed.'
      });
    }

    if (metrics.octaveJumps > 4) {
      totalScore += 8;
      findings.push({
        category: 'Pitch Continuity',
        severity: 'attention',
        title: 'Pitch Discontinuity & Octave Skips',
        metric: `${metrics.octaveJumps} abrupt octave jumps`,
        explanation: 'Rapid octave tracking errors or phase discontinuities detected across adjacent voiced segments.'
      });
    }
  }

  // 3. Frequency & Spectral Features (Max 25 pts)
  // Spectral Rolloff check (TTS vocoder band-limiting)
  if (metrics.avgSpectralRolloff > 0 && metrics.avgSpectralRolloff < 9000 && metrics.sampleRate >= 32000) {
    totalScore += 18;
    findings.push({
      category: 'Frequency Analysis',
      severity: 'anomaly',
      title: 'Artificial High-Frequency Cutoff (Band-Limiting)',
      metric: `Rolloff: ${metrics.avgSpectralRolloff} Hz`,
      explanation: 'Audio displays a sharp spectral cutoff below 9 kHz despite a high sample rate, characteristic of lower-bandwidth neural vocoders or heavy upsampling.'
    });
  } else if (metrics.avgSpectralRolloff > 0 && metrics.avgSpectralRolloff < 13000 && metrics.sampleRate >= 44100) {
    totalScore += 8;
    findings.push({
      category: 'Frequency Analysis',
      severity: 'attention',
      title: 'High-Frequency Energy Attenuation',
      metric: `Rolloff: ${metrics.avgSpectralRolloff} Hz`,
      explanation: 'High-frequency harmonic energy drops off earlier than standard studio recordings, typical of MP3 compression or band-limited synthesis.'
    });
  } else {
    findings.push({
      category: 'Frequency Analysis',
      severity: 'normal',
      title: 'Full-Spectrum Acoustic Profile',
      metric: `Centroid: ${metrics.avgSpectralCentroid} Hz • Rolloff: ${metrics.avgSpectralRolloff} Hz`,
      explanation: 'Natural harmonic distribution across speech formants without artificial brick-wall frequency boundaries.'
    });
  }

  // 4. Waveform Consistency & Clipping (Max 20 pts)
  if (metrics.clippingPercentage > 3.0) {
    totalScore += 14;
    findings.push({
      category: 'Audio Integrity',
      severity: 'anomaly',
      title: 'Severe Digital Waveform Clipping',
      metric: `${metrics.clippingPercentage}% clipped samples`,
      explanation: 'Severe digital overdrive detected with sample amplitudes flattening at ±1.0. This can disguise splicing cuts or result from improper post-processing.'
    });
  } else if (metrics.clippingPercentage > 0.5) {
    totalScore += 6;
    findings.push({
      category: 'Audio Integrity',
      severity: 'attention',
      title: 'Minor Peak Clipping',
      metric: `${metrics.clippingPercentage}% clipped samples`,
      explanation: 'Occasional peak saturation detected.'
    });
  }

  if (metrics.abruptJumps > 4) {
    totalScore += 10;
    findings.push({
      category: 'Audio Consistency',
      severity: 'anomaly',
      title: 'Abrupt Waveform Splices Detected',
      metric: `${metrics.abruptJumps} discontinuous amplitude jumps`,
      explanation: 'Sudden, unnatural shifts in RMS energy detected between adjacent frames, characteristic of audio concatenation or editing splices.'
    });
  }

  // Clamp score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, totalScore));
  const classification = getRiskClassification(finalScore);

  return {
    isInsufficient: false,
    anomalyScore: finalScore,
    classification,
    findings,
    disclaimer: 'This report identifies technical irregularities. It cannot conclusively determine whether media was generated or manipulated using AI.'
  };
}

/**
 * Evaluates Video Authenticity Metrics and generates structured findings
 */
export function scoreVideoAuthenticity(metrics) {
  if (!metrics || metrics.status === 'insufficient_data') {
    return {
      isInsufficient: true,
      anomalyScore: null,
      classification: null,
      findings: [],
      summaryMessage: 'INSUFFICIENT DATA FOR RELIABLE ANALYSIS'
    };
  }

  let totalScore = 0;
  const findings = [];

  // 1. Frame Consistency & Duplication (Max 35 pts)
  if (metrics.duplicateRatio > 25) {
    totalScore += 25;
    findings.push({
      category: 'Frame Consistency',
      severity: 'anomaly',
      title: 'High Ratio of Frozen / Duplicated Frames',
      metric: `${metrics.duplicateRatio}% identical frames (${metrics.identicalFrameCount} frames)`,
      explanation: 'A significant portion of sampled frames are virtually identical (MSE < 1.0). In talking-head videos, repeated frozen frames often accompany AI face-reenactment or low-frame-rate synthesis.'
    });
  } else if (metrics.duplicateRatio > 10) {
    totalScore += 12;
    findings.push({
      category: 'Frame Consistency',
      severity: 'attention',
      title: 'Intermittent Frame Freezing',
      metric: `${metrics.duplicateRatio}% identical frames`,
      explanation: 'Minor frame duplication detected, which can stem from variable frame rate encoding or screen capture buffering.'
    });
  } else {
    findings.push({
      category: 'Frame Consistency',
      severity: 'normal',
      title: 'Continuous Frame Progression',
      metric: `${metrics.avgSimilarity}% average similarity`,
      explanation: 'Natural frame-to-frame pixel variations observed across the timeline without frozen loops.'
    });
  }

  // 2. Abrupt Transitions & Splicing (Max 25 pts)
  if (metrics.abruptTransitions > 3) {
    totalScore += 20;
    findings.push({
      category: 'Temporal Continuity',
      severity: 'anomaly',
      title: 'Multiple Splicing Discontinuities',
      metric: `${metrics.abruptTransitions} sharp cut points`,
      explanation: 'Significant sudden visual leaps detected across the timeline. Indicates frequent scene cuts, spliced video sequences, or missing motion transitions.'
    });
  } else if (metrics.abruptTransitions > 0) {
    totalScore += 8;
    findings.push({
      category: 'Temporal Continuity',
      severity: 'attention',
      title: 'Scene Cut / Jump Detected',
      metric: `${metrics.abruptTransitions} transition points`,
      explanation: 'Standard cut or visual discontinuity detected.'
    });
  }

  // 3. Brightness & Contrast Stability (Max 20 pts)
  if (metrics.brightnessStdDev > 35) {
    totalScore += 16;
    findings.push({
      category: 'Luminance Analysis',
      severity: 'anomaly',
      title: 'Erratic Lighting / Flicker Instability',
      metric: `Brightness σ = ${metrics.brightnessStdDev}`,
      explanation: 'Severe frame-to-frame lighting and contrast fluctuations observed, often symptomatic of frame-by-frame deepfake generation or unstable generative models.'
    });
  } else if (metrics.brightnessStdDev > 20) {
    totalScore += 8;
    findings.push({
      category: 'Luminance Analysis',
      severity: 'attention',
      title: 'Dynamic Lighting Variations',
      metric: `Brightness σ = ${metrics.brightnessStdDev}`,
      explanation: 'Noticeable lighting shifts detected across frames.'
    });
  } else {
    findings.push({
      category: 'Luminance Analysis',
      severity: 'normal',
      title: 'Stable Frame Illumination',
      metric: `Mean Luma: ${metrics.meanBrightness} (σ = ${metrics.brightnessStdDev})`,
      explanation: 'Even, consistent lighting and exposure across the video sequence.'
    });
  }

  // 4. Video Compression & Quality (Max 20 pts)
  if (metrics.estimatedBitrateKbps < 350 && metrics.duration > 2.0) {
    totalScore += 12;
    findings.push({
      category: 'Video Quality',
      severity: 'attention',
      title: 'High Compression / Low Bitrate',
      metric: `${metrics.estimatedBitrateKbps} kbps`,
      explanation: 'Heavy video compression detected. Severe compression artifacts (macroblocking) can obscure subtle tampering or mimic synthetic artifacts.'
    });
  } else {
    findings.push({
      category: 'Video Quality',
      severity: 'normal',
      title: 'Adequate Visual Fidelity',
      metric: `${metrics.videoWidth}x${metrics.videoHeight} • ${metrics.estimatedBitrateKbps} kbps`,
      explanation: 'Resolution and bitrate are sufficient for temporal feature evaluation.'
    });
  }

  // 5. Integrate Audio track if video contains audio
  if (metrics.audioAnalysis) {
    const audioScoreResult = scoreAudioAuthenticity(metrics.audioAnalysis);
    if (!audioScoreResult.isInsufficient && audioScoreResult.anomalyScore > 0) {
      // Blend 30% of audio anomaly score into overall video score
      totalScore = Math.round(totalScore * 0.7 + audioScoreResult.anomalyScore * 0.3);
    }
  }

  const finalScore = Math.min(100, Math.max(0, totalScore));
  const classification = getRiskClassification(finalScore);

  return {
    isInsufficient: false,
    anomalyScore: finalScore,
    classification,
    findings,
    disclaimer: 'This report identifies technical irregularities. It cannot conclusively determine whether media was generated or manipulated using AI.'
  };
}

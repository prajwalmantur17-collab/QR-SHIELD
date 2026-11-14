/**
 * Audio Signal Processing & Authenticity Analysis Engine
 * Uses Web Audio API & Pure JavaScript mathematical calculations.
 * Runs 100% locally in the browser with ZERO external APIs or machine learning.
 */

/**
 * Decodes audio file ArrayBuffer into PCM Float32Array using Web Audio API
 */
export async function decodeAudioBuffer(file) {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtxClass) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  const audioCtx = new AudioCtxClass();
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return {
      audioBuffer,
      sampleRate: audioBuffer.sampleRate,
      duration: audioBuffer.duration,
      numberOfChannels: audioBuffer.numberOfChannels
    };
  } finally {
    if (audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
    }
  }
}

/**
 * Computes windowed Root Mean Square (RMS) amplitude
 */
function computeWindowedRms(channelData, windowSize, hopSize) {
  const rmsValues = [];
  for (let i = 0; i <= channelData.length - windowSize; i += hopSize) {
    let sum = 0;
    for (let j = 0; j < windowSize; j++) {
      const val = channelData[i + j];
      sum += val * val;
    }
    rmsValues.push(Math.sqrt(sum / windowSize));
  }
  return rmsValues;
}

/**
 * Estimates Fundamental Frequency (Pitch F0) using Normalized Autocorrelation
 */
function estimatePitchAutocorrelation(frame, sampleRate, minFreq = 65, maxFreq = 400) {
  const minPeriod = Math.floor(sampleRate / maxFreq);
  const maxPeriod = Math.floor(sampleRate / minFreq);

  let energy = 0;
  for (let i = 0; i < frame.length; i++) {
    energy += frame[i] * frame[i];
  }
  if (energy < 0.001) return null; // Silence / unvoiced

  let bestPeriod = -1;
  let maxCorr = -1;

  for (let lag = minPeriod; lag <= maxPeriod && lag < frame.length; lag++) {
    let corr = 0;
    let lagEnergy = 0;
    for (let i = 0; i < frame.length - lag; i++) {
      corr += frame[i] * frame[i + lag];
      lagEnergy += frame[i + lag] * frame[i + lag];
    }
    const norm = Math.sqrt(energy * lagEnergy);
    const normCorr = norm > 0 ? corr / norm : 0;

    if (normCorr > maxCorr && normCorr > 0.45) {
      maxCorr = normCorr;
      bestPeriod = lag;
    }
  }

  if (bestPeriod > 0) {
    return sampleRate / bestPeriod;
  }
  return null;
}

/**
 * Lightweight Discrete FFT for spectral feature estimation
 */
function computeSpectrum(frame, sampleRate) {
  const N = frame.length;
  // Apply Hann window
  const windowed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    windowed[i] = frame[i] * 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
  }

  // Sample magnitude spectrum at representative frequency bins
  const numBins = 64;
  const magnitudes = new Float32Array(numBins);
  const freqs = new Float32Array(numBins);
  const maxFreq = Math.min(22050, sampleRate / 2);

  let totalEnergy = 0;
  let weightedSum = 0;

  for (let k = 0; k < numBins; k++) {
    const f = (k / (numBins - 1)) * maxFreq;
    freqs[k] = f;
    const omega = (2 * Math.PI * f) / sampleRate;

    let real = 0;
    let imag = 0;
    // Stride for fast browser calculation
    const stride = 2;
    for (let n = 0; n < N; n += stride) {
      real += windowed[n] * Math.cos(omega * n);
      imag -= windowed[n] * Math.sin(omega * n);
    }
    const mag = Math.sqrt(real * real + imag * imag);
    magnitudes[k] = mag;
    totalEnergy += mag;
    weightedSum += f * mag;
  }

  // Spectral Centroid
  const centroid = totalEnergy > 0 ? weightedSum / totalEnergy : 0;

  // Spectral Bandwidth
  let bandSum = 0;
  for (let k = 0; k < numBins; k++) {
    const diff = freqs[k] - centroid;
    bandSum += diff * diff * magnitudes[k];
  }
  const bandwidth = totalEnergy > 0 ? Math.sqrt(bandSum / totalEnergy) : 0;

  // Spectral Rolloff (85% energy threshold)
  let cumulative = 0;
  let rolloff = 0;
  const threshold = totalEnergy * 0.85;
  for (let k = 0; k < numBins; k++) {
    cumulative += magnitudes[k];
    if (cumulative >= threshold) {
      rolloff = freqs[k];
      break;
    }
  }

  return { centroid, bandwidth, rolloff, magnitudes, freqs };
}

/**
 * Calculates Zero Crossing Rate
 */
function computeZeroCrossingRate(frame) {
  let crossings = 0;
  for (let i = 1; i < frame.length; i++) {
    if ((frame[i] >= 0 && frame[i - 1] < 0) || (frame[i] < 0 && frame[i - 1] >= 0)) {
      crossings++;
    }
  }
  return crossings / (frame.length - 1);
}

/**
 * Main Signal Processing & Audio Authenticity Analysis Engine
 */
export async function analyzeAudioAuthenticity(file, onProgress) {
  if (onProgress) onProgress(15, 'Decoding audio PCM buffer...');
  const { audioBuffer, sampleRate, duration, numberOfChannels } = await decodeAudioBuffer(file);

  if (duration < 0.5) {
    return {
      status: 'insufficient_data',
      duration,
      sampleRate,
      numberOfChannels,
      message: 'Audio duration is too short for reliable acoustic analysis (minimum 0.5s required).'
    };
  }

  if (onProgress) onProgress(35, 'Analyzing RMS amplitude and waveform consistency...');

  // Downmix to mono for consistent analysis
  const channelData = audioBuffer.getChannelData(0);
  const totalSamples = channelData.length;

  // Windowing configuration (approx 30ms window, 15ms hop)
  const windowSize = Math.min(2048, Math.pow(2, Math.floor(Math.log2(sampleRate * 0.03))));
  const hopSize = Math.floor(windowSize / 2);
  const numFrames = Math.floor((totalSamples - windowSize) / hopSize);

  // 1. Amplitude & Audio Consistency
  const rmsValues = computeWindowedRms(channelData, windowSize, hopSize);
  let maxRms = 0;
  let sumRms = 0;
  let clippedSamples = 0;

  for (let i = 0; i < totalSamples; i++) {
    if (Math.abs(channelData[i]) >= 0.995) {
      clippedSamples++;
    }
  }
  const clippingPercentage = (clippedSamples / totalSamples) * 100;

  for (let i = 0; i < rmsValues.length; i++) {
    if (rmsValues[i] > maxRms) maxRms = rmsValues[i];
    sumRms += rmsValues[i];
  }
  const meanRms = rmsValues.length > 0 ? sumRms / rmsValues.length : 0;

  // Amplitude variance
  let varSum = 0;
  for (let i = 0; i < rmsValues.length; i++) {
    varSum += Math.pow(rmsValues[i] - meanRms, 2);
  }
  const rmsStdDev = rmsValues.length > 0 ? Math.sqrt(varSum / rmsValues.length) : 0;

  // Abrupt transitions (discontinuities in amplitude)
  let abruptJumps = 0;
  for (let i = 1; i < rmsValues.length; i++) {
    const diff = Math.abs(rmsValues[i] - rmsValues[i - 1]);
    if (diff > 0.35 && rmsValues[i] > 0.05) {
      abruptJumps++;
    }
  }

  // 2. Silence & Noise Floor Analysis
  // Non-zero baseline noise floor
  const nonZeroRms = rmsValues.filter(v => v > 0.0001).sort((a, b) => a - b);
  const noiseFloorRms = nonZeroRms.length > 0 ? nonZeroRms[Math.floor(nonZeroRms.length * 0.1)] : 0;
  const noiseFloorDb = noiseFloorRms > 0 ? 20 * Math.log10(noiseFloorRms) : -100;

  // Check for absolute digital silence (exact zeroes or sub -80dB)
  let pureSilenceFrames = 0;
  const silenceThreshold = Math.max(0.003, noiseFloorRms * 1.5);
  let silenceFrames = 0;
  const silenceSegments = [];
  let currentSilenceLen = 0;

  for (let i = 0; i < rmsValues.length; i++) {
    if (rmsValues[i] < 0.00005) {
      pureSilenceFrames++;
    }
    if (rmsValues[i] < silenceThreshold) {
      silenceFrames++;
      currentSilenceLen++;
    } else {
      if (currentSilenceLen > 0) {
        silenceSegments.push((currentSilenceLen * hopSize) / sampleRate);
        currentSilenceLen = 0;
      }
    }
  }
  if (currentSilenceLen > 0) {
    silenceSegments.push((currentSilenceLen * hopSize) / sampleRate);
  }

  const silenceRatio = rmsValues.length > 0 ? (silenceFrames / rmsValues.length) : 0;
  const absoluteSilenceRatio = rmsValues.length > 0 ? (pureSilenceFrames / rmsValues.length) : 0;

  // Pause duration variance (rigid pause lengths indicate TTS synthesis)
  let pauseDurationMean = 0;
  let pauseDurationStdDev = 0;
  if (silenceSegments.length > 1) {
    pauseDurationMean = silenceSegments.reduce((a, b) => a + b, 0) / silenceSegments.length;
    const pauseVar = silenceSegments.reduce((a, b) => a + Math.pow(b - pauseDurationMean, 2), 0) / silenceSegments.length;
    pauseDurationStdDev = Math.sqrt(pauseVar);
  }

  // 3. Pitch Tracking & Intonation Dynamics
  const pitchContour = [];
  const validPitches = [];
  const pitchHop = Math.max(1, Math.floor(rmsValues.length / 100)); // Sample ~100 points for graphing

  for (let i = 0; i < rmsValues.length; i += pitchHop) {
    const sampleIdx = i * hopSize;
    if (sampleIdx + windowSize <= totalSamples) {
      const frame = channelData.subarray(sampleIdx, sampleIdx + windowSize);
      if (rmsValues[i] > silenceThreshold) {
        const pitch = estimatePitchAutocorrelation(frame, sampleRate);
        pitchContour.push({ time: (sampleIdx / sampleRate), pitch: pitch ? Math.round(pitch) : null });
        if (pitch) validPitches.push(pitch);
      } else {
        pitchContour.push({ time: (sampleIdx / sampleRate), pitch: null });
      }
    }
  }

  let meanPitch = 0;
  let pitchStdDev = 0;
  let octaveJumps = 0;

  if (validPitches.length > 5) {
    meanPitch = validPitches.reduce((a, b) => a + b, 0) / validPitches.length;
    const pitchVar = validPitches.reduce((a, b) => a + Math.pow(b - meanPitch, 2), 0) / validPitches.length;
    pitchStdDev = Math.sqrt(pitchVar);

    for (let i = 1; i < validPitches.length; i++) {
      const ratio = validPitches[i] / validPitches[i - 1];
      if (ratio > 1.85 || ratio < 0.55) {
        octaveJumps++;
      }
    }
  }

  // 4. Frequency & Spectral Centroid Analysis
  // Sample multiple voiced frames across the duration
  let spectralCentroidSum = 0;
  let spectralBandwidthSum = 0;
  let spectralRolloffSum = 0;
  let zcrSum = 0;
  let spectralSamplesCount = 0;

  const spectralStride = Math.max(1, Math.floor(rmsValues.length / 30));
  for (let i = 0; i < rmsValues.length; i += spectralStride) {
    const sampleIdx = i * hopSize;
    if (sampleIdx + windowSize <= totalSamples) {
      const frame = channelData.subarray(sampleIdx, sampleIdx + windowSize);
      const spec = computeSpectrum(frame, sampleRate);
      const zcr = computeZeroCrossingRate(frame);

      spectralCentroidSum += spec.centroid;
      spectralBandwidthSum += spec.bandwidth;
      spectralRolloffSum += spec.rolloff;
      zcrSum += zcr;
      spectralSamplesCount++;
    }
  }

  const avgSpectralCentroid = spectralSamplesCount > 0 ? Math.round(spectralCentroidSum / spectralSamplesCount) : 0;
  const avgSpectralBandwidth = spectralSamplesCount > 0 ? Math.round(spectralBandwidthSum / spectralSamplesCount) : 0;
  const avgSpectralRolloff = spectralSamplesCount > 0 ? Math.round(spectralRolloffSum / spectralSamplesCount) : 0;
  const avgZcr = spectralSamplesCount > 0 ? (zcrSum / spectralSamplesCount) : 0;

  // Waveform visualization downsampled points (~150 points)
  const waveformPoints = [];
  const step = Math.max(1, Math.floor(totalSamples / 150));
  for (let i = 0; i < totalSamples; i += step) {
    let min = 1.0;
    let max = -1.0;
    for (let j = 0; j < step && i + j < totalSamples; j++) {
      const datum = channelData[i + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    waveformPoints.push({ min, max, avg: (Math.abs(min) + Math.abs(max)) / 2 });
  }

  return {
    status: 'success',
    fileName: file.name,
    fileSize: file.size,
    duration,
    sampleRate,
    numberOfChannels,
    clippingPercentage: parseFloat(clippingPercentage.toFixed(2)),
    meanRms: parseFloat(meanRms.toFixed(3)),
    rmsStdDev: parseFloat(rmsStdDev.toFixed(3)),
    abruptJumps,
    noiseFloorDb: Math.round(noiseFloorDb),
    silenceRatio: parseFloat((silenceRatio * 100).toFixed(1)),
    absoluteSilenceRatio: parseFloat((absoluteSilenceRatio * 100).toFixed(1)),
    pauseDurationMean: parseFloat(pauseDurationMean.toFixed(2)),
    pauseDurationStdDev: parseFloat(pauseDurationStdDev.toFixed(2)),
    meanPitch: Math.round(meanPitch),
    pitchStdDev: parseFloat(pitchStdDev.toFixed(1)),
    octaveJumps,
    avgSpectralCentroid,
    avgSpectralBandwidth,
    avgSpectralRolloff,
    avgZcr: parseFloat(avgZcr.toFixed(3)),
    pitchContour,
    waveformPoints,
    rawChannelData: channelData
  };
}

export const analyzeAudioFile = analyzeAudioAuthenticity;

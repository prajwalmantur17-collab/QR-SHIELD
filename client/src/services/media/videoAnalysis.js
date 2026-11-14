/**
 * Video Processing & Authenticity Analysis Engine
 * Uses HTML5 Video, Canvas 2D API & Pure JavaScript mathematical calculations.
 * Runs 100% locally in the browser with ZERO external APIs or machine learning.
 */

import { analyzeAudioAuthenticity } from './audioAnalysis';

/**
 * Loads video element and reads stream metadata
 */
export function loadVideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      resolve({
        video,
        objectUrl,
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        aspectRatio: (video.videoWidth / video.videoHeight).toFixed(2)
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode video file. Format may be unsupported or corrupted.'));
    };
  });
}

/**
 * Computes mean luminance and contrast from ImageData
 */
function computeFrameLuminance(imageData) {
  const data = imageData.data;
  const numPixels = data.length / 4;
  let sumL = 0;

  for (let i = 0; i < data.length; i += 4) {
    // Standard Rec. 601 luma formula
    const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sumL += luma;
  }
  const meanL = sumL / numPixels;

  let varSum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    varSum += Math.pow(luma - meanL, 2);
  }
  const contrast = Math.sqrt(varSum / numPixels);

  return { meanL, contrast };
}

/**
 * Computes Mean Squared Error (MSE) between two consecutive frame ImageDatas
 */
function computeFrameMse(prevData, currData) {
  const d1 = prevData.data;
  const d2 = currData.data;
  const len = d1.length;
  let sumSqDiff = 0;
  const pixelCount = len / 4;

  for (let i = 0; i < len; i += 4) {
    const luma1 = 0.299 * d1[i] + 0.587 * d1[i + 1] + 0.114 * d1[i + 2];
    const luma2 = 0.299 * d2[i] + 0.587 * d2[i + 1] + 0.114 * d2[i + 2];
    const diff = luma1 - luma2;
    sumSqDiff += diff * diff;
  }

  return sumSqDiff / pixelCount;
}

/**
 * Main Video Frame & Anomaly Extraction Engine
 */
export async function analyzeVideoAuthenticity(file, onProgress) {
  const { video, objectUrl, duration, videoWidth, videoHeight, aspectRatio } = await loadVideoMetadata(file);

  if (duration < 0.5) {
    URL.revokeObjectURL(objectUrl);
    return {
      status: 'insufficient_data',
      duration,
      videoWidth,
      videoHeight,
      message: 'Video duration is too short for reliable temporal analysis (minimum 0.5s required).'
    };
  }

  // Setup offscreen canvas for fast pixel processing (scaled to 320x180)
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Number of sample frames across the duration (between 12 and 24 frames)
  const sampleCount = Math.min(24, Math.max(12, Math.floor(duration * 2)));
  const interval = duration / (sampleCount + 1);

  const frameReel = [];
  const frameMetrics = [];
  let prevImageData = null;

  let identicalFrameCount = 0;
  let abruptTransitions = 0;
  let sumSimilarity = 0;
  let comparisonCount = 0;

  for (let idx = 0; idx < sampleCount; idx++) {
    const targetTime = (idx + 1) * interval;
    if (onProgress) {
      onProgress(
        Math.round(((idx + 1) / sampleCount) * 80),
        `Extracting and analyzing frame ${idx + 1} of ${sampleCount}...`
      );
    }

    // Seek to frame timestamp
    video.currentTime = targetTime;
    await new Promise((res) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        res();
      };
      video.addEventListener('seeked', onSeeked);
    });

    // Draw to canvas and sample pixels
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const currImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { meanL, contrast } = computeFrameLuminance(currImageData);

    let mse = 0;
    let similarity = 100;
    let isDuplicated = false;
    let isAbrupt = false;

    if (prevImageData) {
      mse = computeFrameMse(prevImageData, currImageData);
      // Normalized similarity percentage (0-100)
      similarity = Math.max(0, Math.min(100, (1 - Math.sqrt(mse) / 255) * 100));
      sumSimilarity += similarity;
      comparisonCount++;

      // MSE < 1.0 indicates virtually frozen / duplicated frames
      if (mse < 1.0) {
        identicalFrameCount++;
        isDuplicated = true;
      }

      // MSE > 3500 indicates a sharp cut / splicing discontinuity
      if (mse > 3500) {
        abruptTransitions++;
        isAbrupt = true;
      }
    }

    // Capture lightweight thumbnail for the frame reel
    const thumbnail = canvas.toDataURL('image/jpeg', 0.55);

    frameReel.push({
      index: idx + 1,
      time: parseFloat(targetTime.toFixed(2)),
      thumbnail,
      brightness: Math.round(meanL),
      contrast: Math.round(contrast),
      mse: Math.round(mse),
      similarity: parseFloat(similarity.toFixed(1)),
      isDuplicated,
      isAbrupt
    });

    frameMetrics.push({
      time: parseFloat(targetTime.toFixed(1)),
      brightness: Math.round(meanL),
      contrast: Math.round(contrast),
      similarity: parseFloat(similarity.toFixed(1))
    });

    prevImageData = currImageData;
  }

  // Calculate overall video metrics
  const avgSimilarity = comparisonCount > 0 ? (sumSimilarity / comparisonCount) : 100;
  const duplicateRatio = comparisonCount > 0 ? (identicalFrameCount / comparisonCount) * 100 : 0;
  const estimatedBitrateKbps = Math.round((file.size * 8) / (duration * 1000));

  // Luminance stability
  const meanBrightness = frameReel.reduce((a, b) => a + b.brightness, 0) / frameReel.length;
  const brightnessVar = frameReel.reduce((a, b) => a + Math.pow(b.brightness - meanBrightness, 2), 0) / frameReel.length;
  const brightnessStdDev = Math.sqrt(brightnessVar);

  // Optional: Extract audio track from video if available
  let audioAnalysis = null;
  if (onProgress) {
    onProgress(90, 'Analyzing accompanying audio stream...');
  }

  try {
    // Attempt audio decode from the video file ArrayBuffer
    audioAnalysis = await analyzeAudioAuthenticity(file);
    if (audioAnalysis.status === 'insufficient_data') {
      audioAnalysis = null; // No audio track or silent
    }
  } catch {
    // Video has no audio track, which is valid
    audioAnalysis = null;
  }

  // Release memory
  URL.revokeObjectURL(objectUrl);

  if (onProgress) {
    onProgress(100, 'Synthesizing technical findings...');
  }

  return {
    status: 'success',
    fileName: file.name,
    fileSize: file.size,
    duration: parseFloat(duration.toFixed(2)),
    videoWidth,
    videoHeight,
    aspectRatio,
    estimatedBitrateKbps,
    sampleCount,
    totalSampledFrames: sampleCount,
    duplicateRatio: parseFloat(duplicateRatio.toFixed(1)),
    identicalFrameCount,
    abruptTransitions,
    avgSimilarity: parseFloat(avgSimilarity.toFixed(1)),
    meanBrightness: Math.round(meanBrightness),
    brightnessStdDev: parseFloat(brightnessStdDev.toFixed(1)),
    frameReel,
    frameMetrics,
    audioAnalysis
  };
}

export const analyzeVideoFile = analyzeVideoAuthenticity;

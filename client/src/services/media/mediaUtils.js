/**
 * Media Processing & Format Utilities
 * Privacy-first: all processing and history stored in client-side localStorage.
 */

export const SUPPORTED_AUDIO_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/x-m4a', 'audio/webm'];
export const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB safe browser limit

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}.${ms}s`;
}

export function validateMediaFile(file, type = 'audio') {
  if (!file) return { valid: false, error: 'No file provided.' };

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${formatBytes(file.size)}) exceeds the safe 100 MB browser processing limit.`
    };
  }

  const name = file.name.toLowerCase();
  if (type === 'audio') {
    const isAudioExt = /\.(mp3|wav|m4a|aac|ogg|weba)$/i.test(name);
    const isAudioMime = file.type.startsWith('audio/') || SUPPORTED_AUDIO_FORMATS.includes(file.type);
    if (!isAudioExt && !isAudioMime) {
      return {
        valid: false,
        error: 'Unsupported audio format. Please upload MP3, WAV, M4A, AAC, or OGG audio files.'
      };
    }
  } else if (type === 'video') {
    const isVideoExt = /\.(mp4|webm|mov|m4v|ogv)$/i.test(name);
    const isVideoMime = file.type.startsWith('video/') || SUPPORTED_VIDEO_FORMATS.includes(file.type);
    if (!isVideoExt && !isVideoMime) {
      return {
        valid: false,
        error: 'Unsupported video format. Please upload MP4, WebM, or MOV video files.'
      };
    }
  }

  return { valid: true };
}

// Local Audit History Storage (Zero Raw Content Stored)
const HISTORY_STORAGE_KEY = 'qrshield_media_audit_history';

export function saveMediaAuditRecord(record) {
  try {
    const existing = getMediaAuditHistory();
    const safeRecord = {
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      fileName: record.fileName || 'Untitled Media',
      fileSize: record.fileSize || 0,
      duration: record.duration || 0,
      mediaType: record.mediaType || 'audio', // 'audio' | 'video'
      format: record.format || 'unknown',
      anomalyScore: record.anomalyScore ?? 0,
      riskCategory: record.riskCategory || 'Low Anomaly Risk',
      riskVariant: record.riskVariant || 'safe',
      findingsCount: record.findings?.length || 0,
      keyFinding: record.findings?.[0]?.title || 'Standard acoustic / visual profile'
    };

    const updated = [safeRecord, ...existing.slice(0, 49)]; // Keep latest 50
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return safeRecord;
  } catch (err) {
    console.warn('Failed to save media audit record to localStorage:', err);
    return null;
  }
}

export function getMediaAuditHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function clearMediaAuditHistory() {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear media history:', err);
  }
}

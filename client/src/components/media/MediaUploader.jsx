import React, { useRef, useState } from 'react';
import { Upload, FileAudio, FileVideo, X, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { formatBytes, validateMediaFile } from '../../services/media/mediaUtils';

export default function MediaUploader({ 
  mediaType = 'audio', // 'audio' | 'video'
  selectedFile, 
  onFileSelect, 
  onClearFile, 
  onStartAnalysis,
  isAnalyzing = false 
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);

  const isAudio = mediaType === 'audio';
  const acceptedFormats = isAudio 
    ? '.mp3,.wav,.m4a,.aac,.ogg,.weba' 
    : '.mp4,.webm,.mov,.m4v';

  const formatPills = isAudio
    ? ['MP3', 'WAV', 'M4A', 'AAC', 'OGG']
    : ['MP4', 'WebM', 'MOV'];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFile = (file) => {
    setValidationError(null);
    if (!file) return;

    const validation = validateMediaFile(file, mediaType);
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-8 sm:p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
            isDragOver
              ? 'border-brand-teal bg-brand-teal-subtle/40 dark:bg-dark-secondary ring-2 ring-brand-teal/20'
              : 'border-border dark:border-dark-border hover:border-brand-teal/60 bg-white dark:bg-dark-surface hover:bg-canvas-subtle'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-canvas-subtle dark:bg-dark-secondary text-brand-teal border border-border dark:border-dark-border flex items-center justify-center mx-auto shadow-subtle">
            {isAudio ? <FileAudio className="w-6 h-6" /> : <FileVideo className="w-6 h-6" />}
          </div>

          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">
              Click to select or drag & drop {isAudio ? 'audio recording' : 'video clip'}
            </h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText">
              Processed 100% locally in your browser. Maximum file size: 100 MB.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {formatPills.map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-canvas-subtle dark:bg-dark-secondary text-content-secondary dark:text-dark-secondaryText border border-border dark:border-dark-border"
              >
                {fmt}
              </span>
            ))}
          </div>

          {validationError && (
            <div className="p-3 rounded-lg bg-status-danger-bg text-status-danger text-xs font-medium flex items-center space-x-2 max-w-md mx-auto">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
      ) : (
        /* Selected File Card */
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-brand-teal-subtle text-brand-teal flex items-center justify-center flex-shrink-0 border border-brand-teal/20">
                {isAudio ? <FileAudio className="w-5 h-5" /> : <FileVideo className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="teal" size="xs">
                    {selectedFile.type || (isAudio ? 'audio/mpeg' : 'video/mp4')}
                  </Badge>
                  <span className="text-[11px] font-mono text-content-muted">
                    {formatBytes(selectedFile.size)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-content-primary dark:text-dark-primary break-all">
                  {selectedFile.name}
                </h4>
              </div>
            </div>

            {!isAnalyzing && (
              <button
                type="button"
                onClick={onClearFile}
                className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary border border-border dark:border-dark-border transition-colors"
                title="Remove File"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-border dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-content-muted dark:text-dark-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
              <span>Local Browser Signal Processing • Zero Upload</span>
            </div>

            <Button
              size="md"
              variant="primary"
              onClick={onStartAnalysis}
              loading={isAnalyzing}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing Technical Characteristics...' : 'Start Authenticity Analysis'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

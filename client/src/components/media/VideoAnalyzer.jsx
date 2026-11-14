import React, { useState } from 'react';
import { Video, AlertCircle, Film, CheckCircle2 } from 'lucide-react';
import MediaUploader from './MediaUploader';
import VideoFrameViewer from './VideoFrameViewer';
import AudioWaveform from './AudioWaveform';
import AnalysisReport from './AnalysisReport';
import { analyzeVideoFile } from '../../services/media/videoAnalysis';
import { scoreVideoAuthenticity } from '../../services/media/riskScoring';
import { saveMediaAuditRecord } from '../../services/media/mediaUtils';
import Card from '../common/Card';

export default function VideoAnalyzer({ onAuditSaved }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setMetrics(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setMetrics(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setProgress(5);
    setStatusText('Loading video stream and offscreen canvas...');

    try {
      // 1. Analyze Video with frame sampling & luminance/MSE calculations
      const videoMetrics = await analyzeVideoFile(selectedFile, (progressVal, statusVal) => {
        if (typeof progressVal === 'object' && progressVal !== null) {
          setProgress(typeof progressVal.progress === 'number' ? progressVal.progress : 0);
          setStatusText(typeof progressVal.step === 'string' ? progressVal.step : '');
        } else {
          setProgress(typeof progressVal === 'number' ? progressVal : 0);
          setStatusText(typeof statusVal === 'string' ? statusVal : '');
        }
      });

      // 2. Score Authenticity Heuristics
      const evaluationResult = scoreVideoAuthenticity(videoMetrics);

      setMetrics(videoMetrics);
      setResult(evaluationResult);

      // 3. Persist to local client-side audit history
      const savedRecord = saveMediaAuditRecord({
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        duration: videoMetrics.duration,
        mediaType: 'video',
        format: selectedFile.name.split('.').pop() || 'mp4',
        anomalyScore: evaluationResult.anomalyScore ?? 0,
        riskCategory: evaluationResult.classification?.label || 'Evaluated',
        riskVariant: evaluationResult.classification?.variant || 'safe',
        findings: evaluationResult.findings
      });

      if (onAuditSaved && savedRecord) {
        onAuditSaved(savedRecord);
      }
    } catch (err) {
      console.error('Video analysis error:', err);
      setError(err.message || 'Failed to analyze video stream. Please ensure the file is an accessible video format.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    handleClearFile();
  };

  return (
    <div className="space-y-6">
      
      {/* Upload Zone */}
      {!result && (
        <MediaUploader
          mediaType="video"
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onClearFile={handleClearFile}
          onStartAnalysis={handleStartAnalysis}
          isAnalyzing={isAnalyzing}
        />
      )}

      {/* Analysis In-Progress Status Card */}
      {isAnalyzing && (
        <Card elevation="subtle" padding="lg" className="border-border dark:border-dark-border text-center space-y-4">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue-subtle text-brand-blue mx-auto flex items-center justify-center animate-pulse">
              <Film className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-semibold text-content-primary dark:text-dark-primary">
                Sampling Frames & Temporal Consistency
              </h3>
              <p className="text-xs text-content-secondary dark:text-dark-secondaryText">
                {statusText || 'Processing video frames in browser memory...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-canvas-subtle dark:bg-dark-secondary h-2 rounded-full overflow-hidden border border-border dark:border-dark-border">
              <div 
                className="bg-brand-blue h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-content-muted dark:text-dark-secondaryText">
              <span>HTML5 Canvas 2D • MSE Temporal Engine</span>
              <span>{progress}%</span>
            </div>
          </div>
        </Card>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-status-danger-bg border border-status-danger-border flex items-start space-x-3 text-status-danger text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Video Analysis Failed</span>
            <p className="text-status-danger-text">{error}</p>
          </div>
        </div>
      )}

      {/* Visualizations & Findings (Rendered when complete) */}
      {result && metrics && selectedFile && (
        <div className="space-y-6">
          
          {/* Video Player & Sampled Frame Reel */}
          <VideoFrameViewer
            file={selectedFile}
            frameReel={metrics.frameReel}
            frameMetrics={metrics.frameMetrics}
            duration={metrics.duration}
            videoWidth={metrics.videoWidth}
            videoHeight={metrics.videoHeight}
          />

          {/* Full Structured Audit Report */}
          <AnalysisReport
            result={result}
            mediaMetrics={metrics}
            mediaType="video"
            file={selectedFile}
            onReset={handleReset}
          />

        </div>
      )}

    </div>
  );
}

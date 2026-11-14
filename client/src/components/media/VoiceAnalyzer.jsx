import React, { useState } from 'react';
import { Mic, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import MediaUploader from './MediaUploader';
import AudioWaveform from './AudioWaveform';
import AudioMetricsGraph from './AudioMetricsGraph';
import AnalysisReport from './AnalysisReport';
import { analyzeAudioFile } from '../../services/media/audioAnalysis';
import { scoreAudioAuthenticity } from '../../services/media/riskScoring';
import { saveMediaAuditRecord } from '../../services/media/mediaUtils';
import Card from '../common/Card';

export default function VoiceAnalyzer({ onAuditSaved }) {
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
    setStatusText('Decoding audio PCM buffer via Web Audio API...');

    try {
      // 1. Analyze Audio with signal processing
      const audioMetrics = await analyzeAudioFile(selectedFile, (pct, status) => {
        setProgress(pct);
        setStatusText(status);
      });

      // 2. Score Authenticity Heuristics
      const evaluationResult = scoreAudioAuthenticity(audioMetrics);

      setMetrics(audioMetrics);
      setResult(evaluationResult);

      // 3. Persist to local client-side audit history
      const savedRecord = saveMediaAuditRecord({
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        duration: audioMetrics.duration,
        mediaType: 'audio',
        format: selectedFile.name.split('.').pop() || 'mp3',
        anomalyScore: evaluationResult.anomalyScore ?? 0,
        riskCategory: evaluationResult.classification?.label || 'Evaluated',
        riskVariant: evaluationResult.classification?.variant || 'safe',
        findings: evaluationResult.findings
      });

      if (onAuditSaved && savedRecord) {
        onAuditSaved(savedRecord);
      }
    } catch (err) {
      console.error('Audio analysis error:', err);
      setError(err.message || 'Failed to analyze audio signal. Please ensure the file is a valid audio format.');
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
          mediaType="audio"
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
            <div className="w-12 h-12 rounded-2xl bg-brand-teal-subtle text-brand-teal mx-auto flex items-center justify-center animate-pulse">
              <Mic className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-semibold text-content-primary dark:text-dark-primary">
                Performing Local Acoustic Signal Processing
              </h3>
              <p className="text-xs text-content-secondary dark:text-dark-secondaryText">
                {statusText || 'Analyzing speech patterns...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-canvas-subtle dark:bg-dark-secondary h-2 rounded-full overflow-hidden border border-border dark:border-dark-border">
              <div 
                className="bg-brand-teal h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-content-muted dark:text-dark-secondaryText">
              <span>Web Audio API • Math Engine</span>
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
            <span className="font-semibold block">Analysis Failed</span>
            <p className="text-status-danger-text">{error}</p>
          </div>
        </div>
      )}

      {/* Visualizations & Findings (Rendered when complete) */}
      {result && metrics && selectedFile && (
        <div className="space-y-6">
          
          {/* Audio Waveform Player */}
          <AudioWaveform
            file={selectedFile}
            waveformPoints={metrics.waveformPoints}
            duration={metrics.duration}
          />

          {/* Pitch & Spectral Contour */}
          <AudioMetricsGraph
            pitchContour={metrics.pitchContour}
            duration={metrics.duration}
            meanPitch={metrics.meanPitch}
            pitchStdDev={metrics.pitchStdDev}
            silenceRatio={metrics.silenceRatio}
            avgSpectralCentroid={metrics.avgSpectralCentroid}
            avgSpectralRolloff={metrics.avgSpectralRolloff}
          />

          {/* Full Structured Audit Report */}
          <AnalysisReport
            result={result}
            mediaMetrics={metrics}
            mediaType="audio"
            file={selectedFile}
            onReset={handleReset}
          />

        </div>
      )}

    </div>
  );
}

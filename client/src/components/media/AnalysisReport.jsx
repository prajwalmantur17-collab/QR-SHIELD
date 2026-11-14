import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Info, 
  Layers, 
  Activity, 
  Mic, 
  Video, 
  FileText,
  Sliders,
  Eye,
  Lock
} from 'lucide-react';
import Card, { CardHeader } from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatBytes, formatDuration } from '../../services/media/mediaUtils';

export default function AnalysisReport({ 
  result, 
  mediaMetrics, 
  mediaType = 'audio', 
  file, 
  onReset 
}) {
  const [copied, setCopied] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');

  if (!result || !mediaMetrics) {
    return null;
  }

  const { anomalyScore, classification, findings = [], isInsufficient, disclaimer } = result;

  // Format file extension
  const fileExt = file?.name ? file.name.split('.').pop().toUpperCase() : (mediaType === 'audio' ? 'AUDIO' : 'VIDEO');

  // Filter findings
  const filteredFindings = findings.filter(f => {
    if (filterSeverity === 'all') return true;
    return f.severity === filterSeverity;
  });

  const anomalyCount = findings.filter(f => f.severity === 'anomaly').length;
  const attentionCount = findings.filter(f => f.severity === 'attention').length;
  const normalCount = findings.filter(f => f.severity === 'normal').length;

  // Gauge color & stroke offset calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, anomalyScore ?? 0));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getScoreColor = (score) => {
    if (score < 30) return '#23845D'; // Safe Emerald
    if (score < 60) return '#C58A32'; // Warning Amber
    if (score < 80) return '#E06A26'; // High Orange
    return '#D45B61'; // Danger Rose
  };

  const scoreColor = getScoreColor(clampedScore);

  // Copy Markdown summary report to clipboard
  const handleCopyReport = () => {
    const findingsText = findings
      .map(f => `- [${f.severity.toUpperCase()}] **${f.title}**: ${f.metric} — ${f.explanation}`)
      .join('\n');

    const markdown = `# QR SHIELD — Media Authenticity & Risk Audit Report
**File Name:** ${file?.name || 'Unknown'}
**File Size:** ${formatBytes(file?.size)}
**Duration:** ${formatDuration(mediaMetrics.duration)}
**Media Type:** ${mediaType.toUpperCase()} (${fileExt})
**Anomaly Risk Score:** ${anomalyScore}/100 (${classification?.label || 'UNKNOWN'})
**Generated:** ${new Date().toUTCString()}

## Classification Summary
${classification?.summary || 'Standard analysis complete.'}

## Technical Findings (${findings.length} evaluated)
${findingsText}

## Mandatory Methodology Notice
${disclaimer || 'This report identifies technical irregularities. It cannot conclusively determine whether media was generated or manipulated using AI.'}

---
*Generated 100% locally in browser memory via QR Shield Air-Gap Media Engine.*
`;

    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {});
  };

  // Download JSON report
  const handleDownloadJSON = () => {
    const reportData = {
      auditType: 'QR_SHIELD_MEDIA_AUTHENTICITY_AUDIT',
      engineVersion: '2.4.0-pure-signal',
      generatedAt: new Date().toISOString(),
      file: {
        name: file?.name,
        size: file?.size,
        type: file?.type,
        duration: mediaMetrics.duration
      },
      evaluation: {
        mediaType,
        anomalyScore,
        riskClassification: classification?.label,
        summary: classification?.summary
      },
      metrics: { ...mediaMetrics, rawChannelData: undefined, frameReel: undefined },
      findings,
      disclaimer: disclaimer || 'This report identifies technical irregularities. It cannot conclusively determine whether media was generated or manipulated using AI.'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrshield_${mediaType}_audit_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Executive Summary & Anomaly Score Card */}
      <Card elevation="elevated" padding="lg" className="border-border dark:border-dark-border bg-white dark:bg-dark-surface relative overflow-hidden">
        {/* Subtle accent corner glow */}
        <div 
          className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: scoreColor }}
        />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          
          {/* Radial Score Gauge */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                {/* Background Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-canvas-subtle dark:text-dark-secondary"
                />
                {/* Progress Ring */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              
              {/* Score Value inside Circle */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-mono font-bold tracking-tight text-content-primary dark:text-dark-primary">
                  {isInsufficient ? '—' : clampedScore}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-content-muted dark:text-dark-secondaryText">
                  / 100 Score
                </span>
              </div>
            </div>

            <div className="mt-2 text-center">
              <span className="text-[11px] font-mono text-content-muted dark:text-dark-secondaryText uppercase tracking-wider">
                Risk Metric
              </span>
            </div>
          </div>

          {/* Classification & File Details */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Badge 
                variant={classification?.variant || 'neutral'}
                size="md"
                dot
              >
                {classification?.label || 'EVALUATED'}
              </Badge>

              <Badge variant="neutral" size="sm">
                {fileExt} Format
              </Badge>

              <Badge variant="outline" size="sm">
                {formatDuration(mediaMetrics.duration)}
              </Badge>

              <Badge variant="outline" size="sm">
                {formatBytes(file?.size)}
              </Badge>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary dark:text-dark-primary">
              {file?.name || 'Uploaded Media Artifact'}
            </h2>

            <p className="text-sm text-content-secondary dark:text-dark-secondaryText leading-relaxed max-w-2xl">
              {classification?.summary}
            </p>

            {/* Quick Action Toolbar */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <Button
                variant="outline"
                size="sm"
                icon={copied ? Check : Copy}
                onClick={handleCopyReport}
                className={copied ? 'text-status-success border-status-success/40' : ''}
              >
                {copied ? 'Audit Copied!' : 'Copy Audit Summary'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleDownloadJSON}
              >
                Export JSON
              </Button>

              <Button
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={onReset}
                className="text-content-secondary hover:text-content-primary"
              >
                Analyze Another
              </Button>
            </div>

          </div>

        </div>

      </Card>

      {/* 2. Structured Findings & Anomaly Breakdown */}
      <Card elevation="subtle" padding="none" className="border-border dark:border-dark-border overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-canvas-subtle/50 dark:bg-dark-secondary/30">
          <div>
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-brand-teal" />
              <h3 className="text-base font-semibold text-content-primary dark:text-dark-primary">
                Technical Signal Indicators
              </h3>
            </div>
            <p className="text-xs text-content-muted dark:text-dark-secondaryText mt-0.5">
              Individual heuristic evaluations derived from physical signal measurements.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border text-xs">
            <button
              type="button"
              onClick={() => setFilterSeverity('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filterSeverity === 'all' ? 'bg-brand-teal text-white' : 'text-content-secondary hover:text-content-primary'}`}
            >
              All ({findings.length})
            </button>
            {anomalyCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterSeverity('anomaly')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filterSeverity === 'anomaly' ? 'bg-status-danger text-white' : 'text-status-danger hover:bg-red-50 dark:hover:bg-red-950/20'}`}
              >
                Anomalies ({anomalyCount})
              </button>
            )}
            {attentionCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterSeverity('attention')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filterSeverity === 'attention' ? 'bg-status-warning text-white' : 'text-status-warning-text hover:bg-amber-50 dark:hover:bg-amber-950/20'}`}
              >
                Attn ({attentionCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => setFilterSeverity('normal')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${filterSeverity === 'normal' ? 'bg-status-success text-white' : 'text-content-secondary hover:text-content-primary'}`}
            >
              Normal ({normalCount})
            </button>
          </div>
        </div>

        {/* Findings List */}
        <div className="divide-y divide-border dark:divide-dark-border">
          {filteredFindings.map((finding, idx) => {
            const isAnomaly = finding.severity === 'anomaly';
            const isAttention = finding.severity === 'attention';

            return (
              <div 
                key={idx} 
                className={`p-5 transition-colors ${
                  isAnomaly 
                    ? 'bg-red-50/20 dark:bg-red-950/10' 
                    : isAttention 
                      ? 'bg-amber-50/20 dark:bg-amber-950/10' 
                      : 'hover:bg-canvas-subtle/30 dark:hover:bg-dark-secondary/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  
                  <div className="flex items-start space-x-3.5">
                    {/* Severity Icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {isAnomaly ? (
                        <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/40 text-status-danger flex items-center justify-center">
                          <AlertOctagon className="w-4 h-4" />
                        </div>
                      ) : isAttention ? (
                        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-status-warning flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-status-success flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-content-muted dark:text-dark-secondaryText">
                          {finding.category}
                        </span>
                        <Badge 
                          variant={isAnomaly ? 'dangerous' : isAttention ? 'suspicious' : 'safe'}
                          size="xs"
                        >
                          {finding.severity.toUpperCase()}
                        </Badge>
                      </div>

                      <h4 className="text-sm font-semibold text-content-primary dark:text-dark-primary">
                        {finding.title}
                      </h4>

                      <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed pt-0.5">
                        {finding.explanation}
                      </p>
                    </div>

                  </div>

                  {/* Quantitative Metric */}
                  <div className="flex-shrink-0 text-right">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-canvas-subtle dark:bg-dark-secondary text-content-primary dark:text-dark-primary border border-border dark:border-dark-border inline-block">
                      {finding.metric}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}

          {filteredFindings.length === 0 && (
            <div className="p-8 text-center text-content-muted dark:text-dark-secondaryText text-xs">
              No findings matching the selected filter.
            </div>
          )}
        </div>
      </Card>

      {/* 3. Deep Quantitative Signal Measurements Grid */}
      <Card elevation="subtle" padding="lg" className="border-border dark:border-dark-border">
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm font-semibold text-content-primary dark:text-dark-primary">
              Empirical Measurements Breakdown
            </h3>
          </div>
          <p className="text-xs text-content-muted dark:text-dark-secondaryText mt-0.5">
            Raw signal metrics computed directly in-memory using Web Audio API and HTML5 Canvas.
          </p>
        </div>

        {mediaType === 'audio' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Mean Pitch (F₀)</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.meanPitch ? `${mediaMetrics.meanPitch} Hz` : 'Unvoiced / N/A'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Pitch Variance (σ)</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.pitchStdDev ? `±${mediaMetrics.pitchStdDev} Hz` : '0 Hz'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Ambient Noise Floor</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.noiseFloorDb} dB
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Silence Ratio</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.silenceRatio}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Spectral Centroid</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.avgSpectralCentroid} Hz
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Spectral Rolloff (85%)</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.avgSpectralRolloff} Hz
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Zero Crossing Rate</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.avgZcr}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Waveform Peak Clipping</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.clippingPercentage}%
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Sampled Frames</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.totalSampledFrames || mediaMetrics.sampleCount || mediaMetrics.frameReel?.length || 0} frames
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Duplicate Frame Ratio</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.duplicateRatio}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Scene Cuts / Discontinuities</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.abruptTransitions} cuts
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Avg Frame Similarity</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.avgSimilarity}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Mean Luminance (Y)</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.meanBrightness} / 255
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Luminance Variance (σ)</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                ±{mediaMetrics.brightnessStdDev}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Video Resolution</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.videoWidth || '—'} × {mediaMetrics.videoHeight || '—'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="text-[11px] text-content-muted dark:text-dark-secondaryText block">Audio Track Present</span>
              <span className="text-base font-mono font-bold text-content-primary dark:text-dark-primary">
                {mediaMetrics.audioAnalysis ? 'Yes (Analyzed)' : 'No Audio Track'}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* 4. Mandatory Security & Methodology Disclaimers */}
      <div className="p-4 sm:p-5 rounded-2xl bg-canvas-subtle dark:bg-dark-secondary/60 border border-border dark:border-dark-border space-y-3">
        <div className="flex items-start space-x-3">
          <Info className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <span className="font-semibold text-content-primary dark:text-dark-primary block">
              Methodology & Evaluation Disclaimer
            </span>
            <p className="text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              {disclaimer || 'This report identifies technical irregularities. It cannot conclusively determine whether media was generated or manipulated using AI.'} Heuristic metrics such as pitch flatness or zero-energy silence can occasionally occur in professional broadcast recordings, telephony, or aggressively noise-gated microphones. Always combine these indicators with contextual corroboration.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2 border-t border-border dark:border-dark-border text-[11px] text-content-muted dark:text-dark-secondaryText font-mono">
          <Lock className="w-3.5 h-3.5 text-brand-teal" />
          <span>Privacy Guarantee: Processed 100% locally in your browser memory. Media is never uploaded to remote servers.</span>
        </div>
      </div>

    </div>
  );
}

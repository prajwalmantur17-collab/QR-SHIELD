import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Video, 
  History, 
  ShieldCheck, 
  Trash2, 
  FileAudio, 
  FileVideo, 
  Sliders
} from 'lucide-react';
import VoiceAnalyzer from '../components/media/VoiceAnalyzer';
import VideoAnalyzer from '../components/media/VideoAnalyzer';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Tabs from '../components/common/Tabs';
import Modal from '../components/common/Modal';
import PageHeader from '../components/layout/PageHeader';
import usePageTitle from '../hooks/usePageTitle';
import { getMediaAuditHistory, formatBytes, formatDuration } from '../services/media/mediaUtils';

export default function MediaAnalyzerPage() {
  usePageTitle('Media Authenticity');
  const [activeTab, setActiveTab] = useState('audio'); // 'audio' | 'video' | 'history'
  const [historyRecords, setHistoryRecords] = useState([]);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const records = getMediaAuditHistory();
    setHistoryRecords(records);
  };

  const handleAuditSaved = (newRecord) => {
    loadHistory();
  };

  const confirmClearHistory = () => {
    localStorage.removeItem('qrshield_media_audit_history');
    setHistoryRecords([]);
    setShowClearModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* 1. Header & Local Air-Gap Guarantee */}
      <PageHeader
        title="Media Authenticity"
        description="Inspect voice recordings and video clips for technical anomalies, digital splicing, unnatural silence, and frame jitter without external AI APIs or cloud data uploads."
        right={
          <Badge variant="teal" size="sm" dot>
            LOCAL HEURISTIC ENGINE
          </Badge>
        }
      />

      {/* Privacy Callout Banner */}
      <div className="p-4 rounded-2xl bg-brand-teal/5 dark:bg-brand-teal/10 border border-brand-teal/20 flex items-start space-x-3.5">
        <ShieldCheck className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-semibold text-content-primary dark:text-dark-primary block">
            Air-Gap Browser Guarantee
          </span>
          <p className="text-content-secondary dark:text-dark-secondaryText leading-relaxed">
            Your audio and video files are processed entirely in local memory using the browser's native Web Audio API and HTML5 Canvas. Zero media bytes, voiceprints, or video frames are transmitted to remote detection APIs or servers.
          </p>
        </div>
      </div>

      {/* 2. Primary Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[
            { id: 'audio', label: 'Voice Authenticity', icon: Mic },
            { id: 'video', label: 'Video Authenticity', icon: Video },
            { id: 'history', label: 'History (this device)', icon: History, badge: historyRecords.length > 0 ? historyRecords.length : null }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'history' && historyRecords.length > 0 && (
          <Button
            variant="ghost"
            size="xs"
            icon={Trash2}
            onClick={() => setShowClearModal(true)}
            className="text-status-danger hover:text-red-700"
          >
            Clear History
          </Button>
        )}
      </div>

      {/* 3. Tab Contents */}
      <div>
        {activeTab === 'audio' && (
          <VoiceAnalyzer onAuditSaved={handleAuditSaved} />
        )}

        {activeTab === 'video' && (
          <VideoAnalyzer onAuditSaved={handleAuditSaved} />
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {historyRecords.length === 0 ? (
              <Card elevation="subtle" padding="lg" className="text-center py-12 border-border dark:border-dark-border">
                <div className="w-12 h-12 rounded-2xl bg-canvas-subtle dark:bg-dark-secondary text-content-muted mx-auto flex items-center justify-center mb-3">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-content-primary dark:text-dark-primary">
                  No Media Audits Yet
                </h3>
                <p className="text-xs text-content-muted dark:text-dark-secondaryText max-w-sm mx-auto mt-1 mb-4">
                  Upload an audio clip or video file in the tabs above to begin local heuristic inspection.
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('audio')}>
                    Inspect Voice Audio
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('video')}>
                    Inspect Video
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {historyRecords.map((item) => {
                  const isAudio = item.mediaType === 'audio';
                  const dateStr = new Date(item.timestamp).toLocaleString();

                  return (
                    <Card 
                      key={item.id} 
                      elevation="subtle" 
                      padding="md"
                      className="border-border dark:border-dark-border hover:border-brand-teal/40 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isAudio 
                              ? 'bg-brand-teal-subtle text-brand-teal' 
                              : 'bg-brand-blue-subtle text-brand-blue'
                          }`}>
                            {isAudio ? <FileAudio className="w-4 h-4" /> : <FileVideo className="w-4 h-4" />}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-semibold text-content-primary dark:text-dark-primary line-clamp-1">
                                {item.fileName}
                              </h4>
                              <Badge variant={item.riskVariant || 'neutral'} size="xs">
                                {item.anomalyScore}/100 Risk
                              </Badge>
                            </div>

                            <p className="text-xs text-content-secondary dark:text-dark-secondaryText">
                              {item.keyFinding}
                            </p>

                            <div className="flex items-center space-x-3 text-[11px] font-mono text-content-muted dark:text-dark-secondaryText pt-0.5">
                              <span>{formatDuration(item.duration)}</span>
                              <span>•</span>
                              <span>{formatBytes(item.fileSize)}</span>
                              <span>•</span>
                              <span>{dateStr}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-content-muted dark:text-dark-secondaryText">
                            {item.riskCategory}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Educational Architecture & Signal Methodology Primer */}
      <Card elevation="subtle" padding="lg" className="border-border dark:border-dark-border bg-white dark:bg-dark-surface">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-brand-teal" />
            <h3 className="text-sm font-semibold text-content-primary dark:text-dark-primary">
              Signal Processing Methodology
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
            <div className="space-y-2 p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="font-semibold text-content-primary dark:text-dark-primary flex items-center space-x-1.5">
                <Mic className="w-3.5 h-3.5 text-brand-teal" />
                <span>Acoustic Signal Dimensions</span>
              </span>
              <ul className="space-y-1.5 list-disc pl-4 text-[11px]">
                <li><strong>Pitch Trajectory (F₀):</strong> Measured via normalized autocorrelation. Natural human speech exhibits continuous inflection; synthetic speech often shows flat variance or robotic octave jumps.</li>
                <li><strong>Ambient Noise Floor:</strong> True physical microphones capture room acoustic decay. Mathematical zero-energy silence indicates synthetic concatenation or digital gating.</li>
                <li><strong>Spectral Rolloff & Centroid:</strong> Evaluates high-frequency harmonics (85% energy boundary) to detect lossy synthesis cuts or post-filtering.</li>
              </ul>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <span className="font-semibold text-content-primary dark:text-dark-primary flex items-center space-x-1.5">
                <Video className="w-3.5 h-3.5 text-brand-blue" />
                <span>Visual & Temporal Dimensions</span>
              </span>
              <ul className="space-y-1.5 list-disc pl-4 text-[11px]">
                <li><strong>Mean Squared Error (MSE):</strong> Pixel-level frame comparison across uniform time intervals to compute frame similarity curves.</li>
                <li><strong>Frozen / Duplicated Frames:</strong> Detects repetitive static frames (MSE &lt; 1.0) frequently present in AI face reenactments or low-frame-rate rendering.</li>
                <li><strong>Luminance & Contrast Consistency:</strong> Analyzes temporal photometric stability to surface abrupt lighting discontinuities or scene splicing.</li>
              </ul>
            </div>
          </div>

          <div className="text-[11px] text-content-muted dark:text-dark-secondaryText font-mono pt-1">
            * Note: These metrics are empirical indicators designed to assist human analysts. High anomaly scores warrant verification and context, not automatic condemnation.
          </div>
        </div>
      </Card>

      {/* Clear History Confirmation Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear Local Audit History"
      >
        <div className="space-y-4">
          <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
            Are you sure you want to clear your local media audit history? This action will permanently remove all audio and video audit records stored in this browser.
          </p>
          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmClearHistory}
            >
              Clear History
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

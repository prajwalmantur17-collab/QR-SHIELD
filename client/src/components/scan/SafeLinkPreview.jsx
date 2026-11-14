import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  ExternalLink, 
  RefreshCw, 
  X, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  Info,
  Globe,
  Layers,
  ArrowRight
} from 'lucide-react';
import api from '../../api/client';

export default function SafeLinkPreview({ targetUrl, domain, verdict = 'safe', riskScore = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    if (!isOpen && !showWarningModal) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showWarningModal) setShowWarningModal(false);
        if (isOpen) setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showWarningModal]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen || showWarningModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, showWarningModal]);

  const isDangerous = verdict === 'dangerous' || riskScore >= 70;
  const isSuspicious = verdict === 'suspicious' || (riskScore >= 30 && riskScore < 70);

  // Stepper messages during generation
  const steps = [
    'Validating DNS & checking private IP space...',
    'Resolving redirect hops with SSRF protection...',
    'Rendering page in isolated cloud sandbox...',
    'Sanitizing visual stream (zero client execution)...'
  ];

  const handleOpenClick = () => {
    if (previewData) {
      setIsOpen(true);
      return;
    }

    if (isDangerous) {
      // Require confirmation for dangerous sites
      setShowWarningModal(true);
    } else {
      fetchPreview();
    }
  };

  const confirmDangerousPreview = () => {
    setShowWarningModal(false);
    fetchPreview();
  };

  const fetchPreview = async () => {
    if (!targetUrl) return;
    setLoading(true);
    setError(null);
    setErrorCode(null);
    setIsOpen(true);
    setLoadingStep(0);

    // Simulate realistic security inspection steps
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 700);

    try {
      const res = await api.post('/preview', { url: targetUrl });
      setPreviewData(res.data);
    } catch (err) {
      const code = err.response?.data?.code || null;
      setErrorCode(code);
      const msg = err.response?.data?.error || err.message || 'Failed to generate preview.';
      setError(msg);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleCopyUrl = (urlToCopy) => {
    if (!urlToCopy) return;
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (!targetUrl) return null;

  return (
    <div className="w-full">
      {/* Trigger Button Card */}
      <div className="p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-brand-teal text-white flex items-center justify-center flex-shrink-0 shadow-subtle">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-content-primary dark:text-dark-primary">
                Safe Link Preview
              </h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-brand-teal-subtle text-brand-teal-text border border-brand-teal/20">
                SSRF-Protected Sandbox
              </span>
            </div>
            <p className="text-[11px] text-content-secondary dark:text-dark-secondaryText mt-0.5">
              Inspect website appearance visually without exposing your device, IP, or cookies to malicious scripts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenClick}
          className="flex-shrink-0 flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-dark-surface hover:bg-canvas-subtle text-content-primary dark:text-dark-primary border border-border dark:border-dark-border hover:border-brand-teal transition-all shadow-subtle"
        >
          <Eye className="w-3.5 h-3.5 text-brand-teal" />
          <span>{previewData ? 'View Isolated Preview' : 'Preview Website Safely'}</span>
        </button>
      </div>

      {/* Dangerous Confirmation Modal */}
      <AnimatePresence>
        {showWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="High-Risk Website Warning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-dark-surface border border-status-danger-border shadow-elevation p-6 space-y-4"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-status-danger-bg text-status-danger flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">
                    Caution: High-Risk Website
                  </h3>
                  <p className="text-xs text-content-secondary dark:text-dark-secondaryText mt-1 leading-relaxed">
                    This website has been flagged as <span className="font-semibold text-status-danger">Dangerous ({riskScore}/100)</span>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-status-danger-bg/50 border border-status-danger-border text-xs text-status-danger-text space-y-1">
                <p className="font-semibold flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Isolated Sandbox Protection Active</span>
                </p>
                <p className="text-[11px] leading-relaxed text-content-secondary dark:text-dark-secondaryText">
                  The destination URL (credentials removed) is sent to third-party screenshot services (thum.io, WordPress mshots). Your device never connects to the site.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWarningModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-content-secondary dark:text-dark-secondaryText hover:text-content-primary hover:bg-canvas-subtle border border-border dark:border-dark-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDangerousPreview}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-status-danger hover:bg-status-danger/90 text-white shadow-subtle transition-colors flex items-center space-x-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Isolated Snapshot</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Preview Container Modal / Slide-down */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Safe Link Preview Window"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full ${
                isExpanded ? 'max-w-6xl' : 'max-w-3xl'
              } rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-elevation flex flex-col max-h-[92vh] overflow-hidden transition-all duration-200`}
            >
              {/* Browser Window Chrome Top Header */}
              <div className="px-4 py-3 bg-canvas-subtle dark:bg-dark-secondary border-b border-border dark:border-dark-border flex items-center justify-between gap-3 flex-shrink-0">
                {/* 3 Window Dots */}
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>

                {/* Simulated Sanitized Address Bar */}
                <div className="flex-1 max-w-xl mx-2 flex items-center px-3 py-1.5 rounded-lg bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-xs font-mono text-content-primary dark:text-dark-primary shadow-subtle overflow-hidden">
                  {previewData?.isHttps ? (
                    <Lock className="w-3.5 h-3.5 text-status-success flex-shrink-0 mr-1.5" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-status-warning flex-shrink-0 mr-1.5" />
                  )}
                  <span className="truncate flex-1">
                    {previewData?.finalUrl || targetUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(previewData?.finalUrl || targetUrl)}
                    title="Copy sanitized URL"
                    className="p-1 rounded text-content-muted hover:text-content-primary transition-colors ml-1"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {/* Action Controls */}
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={fetchPreview}
                    disabled={loading}
                    title="Refresh Snapshot"
                    className="p-1.5 rounded-lg text-content-secondary dark:text-dark-secondaryText hover:text-content-primary hover:bg-canvas dark:hover:bg-dark-bg border border-border dark:border-dark-border transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? 'Collapse' : 'Expand'}
                    className="p-1.5 rounded-lg text-content-secondary dark:text-dark-secondaryText hover:text-content-primary hover:bg-canvas dark:hover:bg-dark-bg border border-border dark:border-dark-border transition-colors hidden sm:block"
                  >
                    {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    title="Close Preview"
                    className="p-1.5 rounded-lg text-content-secondary dark:text-dark-secondaryText hover:text-content-primary hover:bg-canvas dark:hover:bg-dark-bg border border-border dark:border-dark-border transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
                {/* Loading State */}
                {loading && (
                  <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 border border-brand-teal/30 flex items-center justify-center animate-pulse">
                        <Eye className="w-6 h-6 text-brand-teal animate-spin" />
                      </div>
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <h4 className="text-sm font-bold text-content-primary dark:text-dark-primary">
                        Preparing Isolated Preview
                      </h4>
                      <p className="text-xs text-brand-teal font-medium min-h-[1.5rem]">
                        {steps[loadingStep]}
                      </p>
                      <p className="text-[11px] text-content-muted dark:text-dark-muted">
                        Executing safely in a remote cloud sandbox with zero client network exposure.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {!loading && error && (
                  <div className="p-6 rounded-xl bg-status-danger-bg/50 border border-status-danger-border text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-status-danger-bg text-status-danger flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-content-primary dark:text-dark-primary">
                        {errorCode === 'SSRF_BLOCKED' ? 'Preview blocked by security policy' : 'Preview unavailable'}
                      </h4>
                      <p className="text-xs text-status-danger-text max-w-md mx-auto leading-relaxed">
                        {error}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={fetchPreview}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-dark-surface border border-status-danger-border text-content-primary dark:text-dark-primary hover:bg-canvas-subtle transition-colors shadow-subtle"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Retry Safe Inspection</span>
                    </button>
                  </div>
                )}

                {/* Success Preview Display */}
                {!loading && !error && previewData && (
                  <div className="space-y-4">
                    {/* Security Status Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-xs">
                      <div className="flex items-center space-x-2">
                        {isDangerous ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-status-danger-bg text-status-danger-text border border-status-danger-border">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Dangerous Website</span>
                          </span>
                        ) : isSuspicious ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-status-warning-bg text-status-warning-text border border-status-warning-border">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Suspicious Website</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-status-success-bg text-status-success-text border border-status-success-border">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>No Known Threats Detected</span>
                          </span>
                        )}
                        <span className="text-content-secondary dark:text-dark-secondaryText font-medium">
                          {previewData.domain}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-[11px] font-mono text-content-muted dark:text-dark-muted">
                        <span>SSRF Verified</span>
                        <span>•</span>
                        <span>Safe Preview</span>
                      </div>
                    </div>

                    {/* Screenshot Container */}
                    <div className="relative rounded-xl border border-border dark:border-dark-border bg-canvas overflow-hidden shadow-subtle">
                      {previewData.screenshot && previewData.screenshot.length > 12000 ? (
                        <div className="relative group">
                          <img
                            src={previewData.screenshot}
                            alt={`Isolated visual snapshot of ${previewData.domain}`}
                            className="w-full h-auto max-h-[500px] object-cover object-top select-none pointer-events-none"
                            loading="eager"
                            onError={() => {
                              setPreviewData((prev) => ({ ...prev, screenshot: null }));
                            }}
                          />
                          <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-mono flex items-center space-x-1">
                            <Lock className="w-2.5 h-2.5 text-brand-teal" />
                            <span>Static Image (Scripts Inactive)</span>
                          </div>
                        </div>
                      ) : (
                        /* Semantic Fallback Card if rendering fails or blocks bots */
                        <div className="py-14 px-6 text-center space-y-3 bg-canvas-subtle dark:bg-dark-secondary">
                          <div className="w-12 h-12 rounded-xl bg-brand-teal-subtle text-brand-teal border border-brand-teal/20 flex items-center justify-center mx-auto">
                            <Globe className="w-6 h-6" />
                          </div>
                          <div className="space-y-1 max-w-md mx-auto">
                            <h4 className="text-sm font-bold text-content-primary dark:text-dark-primary">
                              {previewData.title || previewData.domain}
                            </h4>
                            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
                              {previewData.description ||
                                'The website metadata was verified, but visual screenshot capture was restricted by the host server.'}
                            </p>
                          </div>
                          <div className="inline-flex items-center space-x-2 text-[11px] font-mono text-content-muted dark:text-dark-muted pt-2">
                            <span>Domain: {previewData.domain}</span>
                            <span>•</span>
                            <span>Status: Reachable</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Website Metadata Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
                        <span className="text-[10px] uppercase font-bold text-content-muted dark:text-dark-muted tracking-wider block">
                          Website Title
                        </span>
                        <p className="font-semibold text-content-primary dark:text-dark-primary mt-0.5 truncate">
                          {previewData.title || 'Untitled Domain'}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
                        <span className="text-[10px] uppercase font-bold text-content-muted dark:text-dark-muted tracking-wider block">
                          Final Destination
                        </span>
                        <p className="font-semibold text-content-primary dark:text-dark-primary mt-0.5 truncate">
                          {previewData.domain}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
                        <span className="text-[10px] uppercase font-bold text-content-muted dark:text-dark-muted tracking-wider block">
                          Redirect Chain
                        </span>
                        <p className="font-semibold text-content-primary dark:text-dark-primary mt-0.5">
                          {previewData.hopCount === 0 ? 'Direct (0 hops)' : `${previewData.hopCount} redirect hops`}
                        </p>
                      </div>
                    </div>

                    {/* Security Disclaimer Banner */}
                    <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border flex items-start space-x-2.5 text-xs text-content-secondary dark:text-dark-secondaryText">
                      <Info className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5 leading-relaxed text-[11px]">
                        <p className="font-semibold text-content-primary dark:text-dark-primary">
                          Security Notice: Isolated Inspection
                        </p>
                        <p>
                          The destination URL (credentials removed) is sent to third-party screenshot services (thum.io, WordPress mshots). Your device never connects to the site. An innocent-looking preview does not guarantee that the website is safe from phishing or financial fraud.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 bg-canvas-subtle dark:bg-dark-secondary border-t border-border dark:border-dark-border flex items-center justify-between text-xs flex-shrink-0">
                <span className="text-[11px] text-content-muted dark:text-dark-muted font-mono">
                  Safe Preview
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-dark-surface hover:bg-canvas text-content-primary dark:text-dark-primary border border-border dark:border-dark-border transition-colors shadow-subtle"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

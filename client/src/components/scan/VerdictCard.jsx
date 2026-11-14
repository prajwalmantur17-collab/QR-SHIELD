import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Copy, 
  Flag, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Check, 
  Info,
  DollarSign,
  Layers,
  ArrowRight
} from 'lucide-react';
import RiskGauge from './RiskGauge';
import SafeLinkPreview from './SafeLinkPreview';
import api from '../../api/client';

export default function VerdictCard({ result, onScanAnother }) {
  const [copied, setCopied] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [reportCount, setReportCount] = useState(null);

  if (!result) return null;

  const {
    verdict = 'safe',
    risk_score = 0,
    scam_category = 'Legitimate',
    ai_used = false,
    confidence = 0.9,
    recommended_action = '',
    signals = [],
    hops = [],
    hopCount = 0,
    isHttps = true,
    tldRisk = false,
    upiDetails = null,
    domain = '',
    contentHash = '',
    cached = false
  } = result;

  // Determine if this result has an inspectable HTTP/HTTPS destination
  const previewableUrl = 
    (hops && hops.length > 0 && hops[hops.length - 1] && /^https?:\/\//i.test(hops[hops.length - 1]) ? hops[hops.length - 1] : null) ||
    (result.finalUrl && /^https?:\/\//i.test(result.finalUrl) ? result.finalUrl : null) ||
    (domain && domain.includes('.') ? `https://${domain}` : null);

  // Enterprise status theme mapping
  const verdictConfig = {
    safe: {
      label: 'Safe',
      badgeClass: 'bg-status-success-bg text-status-success-text border-status-success-border',
      icon: ShieldCheck,
      cardBorder: 'border-status-success-border dark:border-status-success/30',
      summary: 'No critical security threats detected. Safe to interact with standard caution.'
    },
    suspicious: {
      label: 'Suspicious',
      badgeClass: 'bg-status-warning-bg text-status-warning-text border-status-warning-border',
      icon: AlertTriangle,
      cardBorder: 'border-status-warning-border dark:border-status-warning/30',
      summary: 'Heuristic or behavioral anomalies detected. Exercise caution and verify identity.'
    },
    dangerous: {
      label: 'Dangerous',
      badgeClass: 'bg-status-danger-bg text-status-danger-text border-status-danger-border',
      icon: ShieldAlert,
      cardBorder: 'border-status-danger-border dark:border-status-danger/30',
      summary: 'High probability of phishing, credential harvesting, or payment deception.'
    }
  };

  const currentConfig = verdictConfig[verdict] || verdictConfig.safe;
  const VerdictIcon = currentConfig.icon;

  const handleCopyReport = () => {
    const reportText = `[QR SHIELD AUDIT REPORT]
Verdict: ${verdict.toUpperCase()} (Risk Score: ${risk_score}/100)
Category: ${scam_category}
Action: ${recommended_action}
Key Signals:
${signals.map(s => `- [${s.source.toUpperCase()}] ${s.label}: ${s.detail}`).join('\n')}
Verified with Zero-Knowledge Hashes. Scan before you trust.`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReportScam = async () => {
    if (reported || reporting) return;
    setReporting(true);
    try {
      const target = domain || (hops && hops[0]) || contentHash;
      const res = await api.post('/report', { target });
      setReported(true);
      setReportCount(res.data.reportCount);
    } catch (err) {
      console.error('Report submission failed:', err);
    } finally {
      setReporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full rounded-2xl bg-white dark:bg-dark-surface border ${currentConfig.cardBorder} p-6 sm:p-8 space-y-6 shadow-card transition-colors`}
    >
      {/* Top Banner: Status Badge, Title & Risk Score Gauge */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border dark:border-dark-border">
        <div className="space-y-2.5 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentConfig.badgeClass}`}
            >
              <VerdictIcon className="w-4 h-4" />
              <span>{currentConfig.label}</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-canvas-subtle dark:bg-dark-secondary text-content-secondary dark:text-dark-secondaryText border border-border dark:border-dark-border">
              <span>Category:</span>
              <strong className="text-content-primary dark:text-dark-primary font-semibold ml-1">{scam_category}</strong>
            </span>

            {cached && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-canvas-subtle dark:bg-dark-secondary text-brand-teal dark:text-brand-teal border border-border dark:border-dark-border">
                Cached 24h
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-content-primary dark:text-dark-primary tracking-tight">
            {currentConfig.summary}
          </h2>

          <p className="text-xs text-content-muted dark:text-dark-muted font-mono flex items-center justify-center md:justify-start space-x-2">
            <span>SHA-256: {contentHash ? contentHash.slice(0, 16) + '...' : 'Verified'}</span>
            <span>•</span>
            <span>Confidence: {Math.round(confidence * 100)}%</span>
            {ai_used && (
              <>
                <span>•</span>
                <span className="text-brand-teal font-sans font-semibold">Gemini AI Active</span>
              </>
            )}
          </p>
        </div>

        {/* Gauge */}
        <div className="flex-shrink-0">
          <RiskGauge score={risk_score} verdict={verdict} />
        </div>
      </div>

      {/* Recommended Action Callout */}
      {recommended_action && (
        <div
          className={`p-4 rounded-xl border flex items-start space-x-3 ${
            verdict === 'dangerous'
              ? 'bg-status-danger-bg border-status-danger-border text-status-danger-text'
              : verdict === 'suspicious'
              ? 'bg-status-warning-bg border-status-warning-border text-status-warning-text'
              : 'bg-status-success-bg border-status-success-border text-status-success-text'
          }`}
        >
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">Recommended Safety Action</h4>
            <p className="text-xs sm:text-sm font-medium leading-relaxed">{recommended_action}</p>
          </div>
        </div>
      )}

      {/* UPI Details Card (if UPI QR) */}
      {upiDetails && (
        <div className="p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
          <div className="flex items-center justify-between border-b border-border dark:border-dark-border pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-teal flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4" />
              <span>Parsed UPI Payment Details</span>
            </h4>
            <span className="text-[11px] font-mono text-content-muted dark:text-dark-muted">Protocol: upi://</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-content-muted dark:text-dark-muted block text-[10px] uppercase font-semibold">Payee Name</span>
              <span className="font-semibold text-content-primary dark:text-dark-primary">{upiDetails.payeeName}</span>
            </div>
            <div>
              <span className="text-content-muted dark:text-dark-muted block text-[10px] uppercase font-semibold">Virtual Payment Address (VPA)</span>
              <span className="font-mono text-brand-blue font-semibold">{upiDetails.vpa}</span>
            </div>
            <div>
              <span className="text-content-muted dark:text-dark-muted block text-[10px] uppercase font-semibold">Requested Amount</span>
              <span className="font-mono text-content-primary dark:text-dark-primary font-bold">{upiDetails.amount}</span>
            </div>
            <div>
              <span className="text-content-muted dark:text-dark-muted block text-[10px] uppercase font-semibold">Transaction Note</span>
              <span className="text-content-secondary dark:text-dark-secondaryText italic font-mono">"{upiDetails.note}"</span>
            </div>
          </div>
        </div>
      )}

      {/* Redirect Chain & Safety Preview (if URL/Link) */}
      {hops && hops.length > 0 && (
        <div className="p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
          <div className="flex items-center justify-between border-b border-border dark:border-dark-border pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-primary dark:text-dark-primary flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-brand-blue" />
              <span>Link Redirect Verification ({hopCount} Hops Followed)</span>
            </h4>
            <div className="flex items-center space-x-2 text-[11px]">
              {isHttps ? (
                <span className="flex items-center space-x-1 text-status-success font-medium">
                  <Lock className="w-3 h-3" />
                  <span>HTTPS Encrypted</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-status-danger font-medium">
                  <Unlock className="w-3 h-3" />
                  <span>Insecure (HTTP)</span>
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-1 font-mono text-xs">
            {hops.map((hopUrl, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-content-secondary dark:text-dark-secondaryText">
                <span className="w-5 h-5 rounded-md bg-white dark:bg-dark-surface border border-border dark:border-dark-border flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="truncate max-w-[85%] text-content-primary dark:text-dark-primary">{hopUrl}</span>
                {idx === hops.length - 1 && (
                  <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded bg-brand-teal-subtle text-brand-teal border border-brand-teal/20">
                    Final Landing
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explainable Signals Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-content-primary dark:text-dark-primary flex items-center space-x-2">
            <span>Detection Reasons & Threat Signals</span>
            <span className="text-xs font-normal text-content-muted dark:text-dark-muted font-mono">
              ({signals.length} {signals.length === 1 ? 'signal' : 'signals'} evaluated)
            </span>
          </h3>
          <div className="flex items-center space-x-2 text-[10px] font-medium">
            <span className="px-2 py-0.5 rounded bg-brand-blue-subtle text-brand-blue-text border border-brand-blue/20">
              RULE: Deterministic
            </span>
            <span className="px-2 py-0.5 rounded bg-brand-teal-subtle text-brand-teal-text border border-brand-teal/20">
              AI: Gemini Neural
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {signals.map((sig, idx) => {
            const isRule = sig.source === 'rule';
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border flex items-start space-x-3 text-xs"
              >
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex-shrink-0 mt-0.5 ${
                    isRule
                      ? 'bg-brand-blue-subtle text-brand-blue-text border border-brand-blue/30'
                      : 'bg-brand-teal-subtle text-brand-teal-text border border-brand-teal/30'
                  }`}
                >
                  {isRule ? 'RULE' : 'AI'}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-content-primary dark:text-dark-primary">{sig.label}</p>
                  <p className="text-content-secondary dark:text-dark-secondaryText mt-0.5 leading-relaxed">{sig.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safe Link Preview (Isolated Air-Gap Inspection) */}
      {previewableUrl && (
        <SafeLinkPreview
          targetUrl={previewableUrl}
          domain={domain}
          verdict={verdict}
          riskScore={risk_score}
        />
      )}

      {/* Action Buttons Bar */}
      <div className="pt-4 border-t border-border dark:border-dark-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {/* Report Scam Button */}
          <button
            type="button"
            onClick={handleReportScam}
            disabled={reported || reporting}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              reported
                ? 'bg-status-danger-bg text-status-danger border-status-danger-border cursor-default'
                : 'bg-white dark:bg-dark-surface hover:bg-status-danger-bg text-content-secondary dark:text-dark-secondaryText hover:text-status-danger border-border dark:border-dark-border'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>
              {reported
                ? `Blacklisted (${reportCount || '1'} reports)`
                : reporting
                ? 'Reporting...'
                : 'Report as Scam'}
            </span>
          </button>

          {/* Copy Report */}
          <button
            type="button"
            onClick={handleCopyReport}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-white dark:bg-dark-surface text-content-secondary dark:text-dark-secondaryText hover:text-content-primary border border-border dark:border-dark-border hover:bg-canvas-subtle transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Report'}</span>
          </button>
        </div>

        {/* Scan Another Item */}
        <button
          type="button"
          onClick={onScanAnother}
          className="flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold bg-brand-teal text-white hover:bg-brand-teal-hover shadow-subtle transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Scan Another Item</span>
        </button>
      </div>
    </motion.div>
  );
}

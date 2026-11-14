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
import Button from '../common/Button';
import Badge from '../common/Badge';

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
    (result.targetUrl && /^https?:\/\//i.test(result.targetUrl) ? result.targetUrl : null) ||
    (result.scannedContent && /^https?:\/\//i.test(result.scannedContent) ? result.scannedContent : null) ||
    (result.scannedContent && /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(result.scannedContent) ? `https://${result.scannedContent}` : null) ||
    (domain && domain.includes('.') ? (domain.startsWith('http') ? domain : `https://${domain}`) : null);

  // Status mapping
  const verdictConfig = {
    safe: {
      label: 'Safe',
      variant: 'safe',
      icon: ShieldCheck,
      cardBorder: 'border-status-success-border dark:border-status-success/30',
      summary: 'No critical threats detected. Safe to interact with standard caution.'
    },
    suspicious: {
      label: 'Suspicious',
      variant: 'suspicious',
      icon: AlertTriangle,
      cardBorder: 'border-status-warning-border dark:border-status-warning/30',
      summary: 'Heuristic anomalies detected. Exercise caution and verify identity.'
    },
    dangerous: {
      label: 'Dangerous',
      variant: 'dangerous',
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
      transition={{ duration: 0.25 }}
      className={`w-full rounded-2xl bg-white dark:bg-dark-surface border ${currentConfig.cardBorder} p-6 sm:p-8 space-y-6 shadow-card transition-colors`}
    >
      {/* 1. Header Banner: Verdict, Category, Gauge */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border dark:border-dark-border">
        <div className="space-y-2.5 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <Badge variant={currentConfig.variant} size="md" icon={VerdictIcon} dot>
              {currentConfig.label}
            </Badge>

            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-canvas-subtle dark:bg-dark-secondary text-content-secondary dark:text-dark-secondaryText border border-border dark:border-dark-border">
              <span>Category:</span>
              <strong className="text-content-primary dark:text-dark-primary font-semibold ml-1">{scam_category}</strong>
            </span>

            {cached && (
              <Badge variant="neutral" size="xs">
                Cached 24h
              </Badge>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-content-primary dark:text-dark-primary tracking-tight">
            {currentConfig.summary}
          </h2>

          <div className="text-[11px] text-content-muted dark:text-dark-muted font-mono flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
            <span>SHA-256: {contentHash ? contentHash.slice(0, 16) + '...' : 'Verified'}</span>
            <span>•</span>
            <span>Confidence: {Math.round(confidence * 100)}%</span>
            {ai_used && (
              <>
                <span>•</span>
                <span className="text-brand-teal font-sans font-semibold">Gemini AI Active</span>
              </>
            )}
          </div>
        </div>

        {/* Gauge */}
        <div className="flex-shrink-0">
          <RiskGauge score={risk_score} verdict={verdict} />
        </div>
      </div>

      {/* 2. Recommended Safety Action */}
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
            <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5 font-mono">Recommended Action</h4>
            <p className="text-xs sm:text-sm font-medium leading-relaxed">{recommended_action}</p>
          </div>
        </div>
      )}

      {/* 3. Parsed UPI Details (if UPI QR) */}
      {upiDetails && (
        <div className="p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
          <div className="flex items-center justify-between border-b border-border dark:border-dark-border pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-teal flex items-center space-x-1.5 font-mono">
              <DollarSign className="w-4 h-4" />
              <span>Parsed UPI Payment Details</span>
            </h4>
            <Badge variant="teal" size="xs">upi://</Badge>
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

      {/* 4. Redirect Chain & Hops Waterfall (if URL) */}
      {hops && hops.length > 0 && (
        <div className="p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
          <div className="flex items-center justify-between border-b border-border dark:border-dark-border pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-primary dark:text-dark-primary flex items-center space-x-1.5 font-mono">
              <Layers className="w-4 h-4 text-brand-blue" />
              <span>Redirect Chain ({hopCount} Hops Followed)</span>
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
                  <Badge variant="teal" size="xs">Final Destination</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Explainable Signals Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-content-primary dark:text-dark-primary flex items-center space-x-2 font-mono">
            <span>Detection Reasons & Heuristics</span>
            <span className="text-xs font-normal text-content-muted dark:text-dark-muted font-mono">
              ({signals.length} {signals.length === 1 ? 'signal' : 'signals'})
            </span>
          </h3>
          <div className="flex items-center space-x-2 text-[10px] font-medium">
            <Badge variant="blue" size="xs">RULE: Deterministic</Badge>
            <Badge variant="teal" size="xs">AI: Gemini Neural</Badge>
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
                <Badge variant={isRule ? 'blue' : 'teal'} size="xs" className="mt-0.5 flex-shrink-0">
                  {isRule ? 'RULE' : 'AI'}
                </Badge>
                <div className="flex-1">
                  <p className="font-semibold text-content-primary dark:text-dark-primary">{sig.label}</p>
                  <p className="text-content-secondary dark:text-dark-secondaryText mt-0.5 leading-relaxed">{sig.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Safe Link Preview (Isolated Air-Gap Inspection) */}
      {previewableUrl && (
        <SafeLinkPreview
          targetUrl={previewableUrl}
          domain={domain || result.domain || (previewableUrl ? previewableUrl.replace(/^https?:\/\//i, '').split('/')[0] : '')}
          verdict={verdict}
          riskScore={risk_score}
        />
      )}

      {/* 7. Action Buttons Bar */}
      <div className="pt-4 border-t border-border dark:border-dark-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {/* Report Scam Button */}
          <Button
            size="sm"
            variant={reported ? 'danger' : 'outline'}
            icon={Flag}
            onClick={handleReportScam}
            disabled={reported || reporting}
          >
            {reported
              ? `Blacklisted (${reportCount || '1'} reports)`
              : reporting
              ? 'Reporting...'
              : 'Report Scam'}
          </Button>

          {/* Copy Report */}
          <Button
            size="sm"
            variant="outline"
            icon={copied ? Check : Copy}
            onClick={handleCopyReport}
          >
            {copied ? 'Copied' : 'Copy Audit Report'}
          </Button>
        </div>

        {/* Scan Another Item */}
        <Button
          size="sm"
          variant="primary"
          icon={RefreshCw}
          onClick={onScanAnother}
        >
          Scan Another Item
        </Button>
      </div>
    </motion.div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink, 
  Share2, 
  Copy, 
  Flag, 
  RefreshCw, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Check, 
  Info,
  DollarSign,
  Cpu,
  Layers
} from 'lucide-react';
import RiskGauge from './RiskGauge';
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

  // Verdict theme mapping
  const verdictConfig = {
    safe: {
      label: 'SAFE',
      bgBadge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      icon: ShieldCheck,
      cardBorder: 'border-emerald-500/30',
      glowClass: 'shadow-glow-safe',
      summary: 'No critical threats detected. Safe to interact.'
    },
    suspicious: {
      label: 'SUSPICIOUS',
      bgBadge: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      icon: AlertTriangle,
      cardBorder: 'border-amber-500/30',
      glowClass: 'shadow-glow',
      summary: 'Heuristic or behavioral anomalies detected. Exercise extreme caution.'
    },
    dangerous: {
      label: 'DANGEROUS',
      bgBadge: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      icon: ShieldAlert,
      cardBorder: 'border-rose-500/30',
      glowClass: 'shadow-glow-danger',
      summary: 'High probability malicious scam, phishing, or extortion attempt.'
    }
  };

  const currentConfig = verdictConfig[verdict] || verdictConfig.safe;
  const VerdictIcon = currentConfig.icon;

  // Copy plain-text report
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

  // Community report submission
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`w-full rounded-2xl bg-dark-surface border ${currentConfig.cardBorder} p-6 sm:p-8 space-y-6 ${currentConfig.glowClass} transition-all`}
    >
      {/* Top Banner: Verdict & Risk Score Gauge */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-dark-border/60">
        <div className="space-y-3 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentConfig.bgBadge}`}
            >
              <VerdictIcon className="w-4 h-4" />
              <span>{currentConfig.label}</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-dark-elevated text-dark-muted border border-dark-border">
              <span>Category:</span>
              <strong className="text-dark-text ml-1">{scam_category}</strong>
            </span>

            {cached && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-indigo/10 text-brand-cyan border border-brand-indigo/30">
                24h Cached
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-dark-text tracking-tight">
            {currentConfig.summary}
          </h2>

          <p className="text-xs text-dark-muted font-mono flex items-center justify-center md:justify-start space-x-2">
            <span>SHA-256 Hash: {contentHash ? contentHash.slice(0, 16) + '...' : 'Verified'}</span>
            <span>•</span>
            <span>AI Confidence: {Math.round(confidence * 100)}%</span>
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
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              : verdict === 'suspicious'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}
        >
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">Recommended Action</h4>
            <p className="text-sm font-medium leading-relaxed">{recommended_action}</p>
          </div>
        </div>
      )}

      {/* UPI Details Card (if UPI QR) */}
      {upiDetails && (
        <div className="p-4 rounded-xl bg-dark-elevated border border-dark-border space-y-3">
          <div className="flex items-center justify-between border-b border-dark-border/60 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-cyan flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4" />
              <span>Parsed UPI Transaction Spec</span>
            </h4>
            <span className="text-[11px] font-mono text-dark-muted">Protocol: upi://</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-dark-muted block text-[10px] uppercase">Payee Name</span>
              <span className="font-semibold text-dark-text">{upiDetails.payeeName}</span>
            </div>
            <div>
              <span className="text-dark-muted block text-[10px] uppercase">Virtual Payment Address (VPA)</span>
              <span className="font-mono text-brand-cyan font-semibold">{upiDetails.vpa}</span>
            </div>
            <div>
              <span className="text-dark-muted block text-[10px] uppercase">Requested Amount</span>
              <span className="font-mono text-dark-text font-bold">{upiDetails.amount}</span>
            </div>
            <div>
              <span className="text-dark-muted block text-[10px] uppercase">Transaction Note</span>
              <span className="text-dark-text italic font-mono">"{upiDetails.note}"</span>
            </div>
          </div>
        </div>
      )}

      {/* Redirect Chain & Safety Preview (if URL/Link) */}
      {hops && hops.length > 0 && (
        <div className="p-4 rounded-xl bg-dark-elevated border border-dark-border space-y-3">
          <div className="flex items-center justify-between border-b border-dark-border/60 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-dark-text flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-brand-indigo" />
              <span>Link Redirect Stepper ({hopCount} Hops Followed)</span>
            </h4>
            <div className="flex items-center space-x-2 text-[11px]">
              {isHttps ? (
                <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                  <Lock className="w-3 h-3" />
                  <span>HTTPS Verified</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-rose-400 font-medium">
                  <Unlock className="w-3 h-3" />
                  <span>No HTTPS</span>
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-1 font-mono text-xs">
            {hops.map((hopUrl, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-dark-muted">
                <span className="w-5 h-5 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center text-[10px] flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="truncate max-w-[85%] text-dark-text">{hopUrl}</span>
                {idx === hops.length - 1 && (
                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-brand-indigo/20 text-brand-cyan border border-brand-indigo/30">
                    Final Destination
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explainable Signals Breakdown (Why we think so) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-dark-text flex items-center space-x-2">
            <span>Audit Findings & Threat Signals</span>
            <span className="text-xs font-normal text-dark-muted font-mono">
              ({signals.length} {signals.length === 1 ? 'signal' : 'signals'} evaluated)
            </span>
          </h3>
          <div className="flex items-center space-x-2 text-[10px] font-mono">
            <span className="px-1.5 py-0.5 rounded bg-brand-indigo/20 text-indigo-300 border border-brand-indigo/30">
              RULE: Deterministic
            </span>
            <span className="px-1.5 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
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
                className="p-3 rounded-xl bg-dark-elevated/60 border border-dark-border flex items-start space-x-3 text-xs"
              >
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex-shrink-0 mt-0.5 ${
                    isRule
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {isRule ? 'RULE' : 'AI'}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-dark-text">{sig.label}</p>
                  <p className="text-dark-muted mt-0.5 leading-relaxed">{sig.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="pt-4 border-t border-dark-border/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {/* Report Scam Button */}
          <button
            onClick={handleReportScam}
            disabled={reported || reporting}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              reported
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 cursor-default'
                : 'bg-dark-elevated hover:bg-rose-500/10 text-dark-text hover:text-rose-400 border-dark-border hover:border-rose-500/30'
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
            onClick={handleCopyReport}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-dark-elevated text-dark-muted hover:text-dark-text border border-dark-border hover:border-dark-border/80 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Report'}</span>
          </button>
        </div>

        {/* Scan Another */}
        <button
          onClick={onScanAnother}
          className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-indigo to-brand-dark text-white shadow-glow hover:opacity-95 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Scan Another Item</span>
        </button>
      </div>
    </motion.div>
  );
}

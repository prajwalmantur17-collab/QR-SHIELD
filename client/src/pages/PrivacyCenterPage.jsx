import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  AlertTriangle,
  KeyRound,
  Database,
  FileCode,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PrivacyCenterPage() {
  const { user, isAuthenticated, deleteMyData } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMyData();
      setShowConfirmModal(false);
      setSuccessMsg('Your account and all associated scan history have been permanently purged.');
    } catch (err) {
      console.error('Delete data error:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold text-brand-teal bg-brand-teal-subtle border border-brand-teal/20">
          <Lock className="w-3.5 h-3.5" />
          <span>Zero-Knowledge Privacy Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary dark:text-dark-primary tracking-tight">
          Privacy Center & Trust Engine
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary dark:text-dark-secondaryText">
          We built QR Shield on a core principle: security tools should never become the data-collectors of the threats they analyze.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-status-success-bg border border-status-success-border text-status-success text-xs text-center font-medium">
          {successMsg}
        </div>
      )}

      {/* Two-Column Comparison: What We Store vs What We Never Store */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Column 1: What We Store */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-status-success-border dark:border-status-success/30 shadow-card space-y-4">
          <div className="flex items-center space-x-2 text-status-success">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-xs font-bold uppercase tracking-wider">What We Store</h3>
          </div>
          <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
            Only non-reversible mathematical fingerprints and categorical scores required for rate limits and telemetry:
          </p>

          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <KeyRound className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-content-primary dark:text-dark-primary font-semibold">Salted HMAC-SHA-256 Hashes</strong>
                <span className="text-[11px] text-content-secondary dark:text-dark-secondaryText">One-way cryptographic fingerprint of the scanned text.</span>
              </div>
            </li>
            <li className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <ShieldCheck className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-content-primary dark:text-dark-primary font-semibold">Verdict & Numeric Risk Score</strong>
                <span className="text-[11px] text-content-secondary dark:text-dark-secondaryText">"Safe", "Suspicious", or "Dangerous" + numeric risk level (0–100).</span>
              </div>
            </li>
            <li className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <Database className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-content-primary dark:text-dark-primary font-semibold">Community Blacklist Domain Hashes</strong>
                <span className="text-[11px] text-content-secondary dark:text-dark-secondaryText">Domain hashes reported by users to shield the wider community.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Column 2: What We Never Store */}
        <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-status-danger-border dark:border-status-danger/30 shadow-card space-y-4">
          <div className="flex items-center space-x-2 text-status-danger">
            <XCircle className="w-5 h-5" />
            <h3 className="text-xs font-bold uppercase tracking-wider">What We NEVER Store</h3>
          </div>
          <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
            No private user communications or media ever touch persistent disk storage:
          </p>

          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <EyeOff className="w-4 h-4 text-status-danger flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-content-primary dark:text-dark-primary font-semibold">Zero Raw URLs or Auth Tokens</strong>
                <span className="text-[11px] text-content-secondary dark:text-dark-secondaryText">Sensitive link tokens and full paths are discarded in memory.</span>
              </div>
            </li>
            <li className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <EyeOff className="w-4 h-4 text-status-danger flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-content-primary dark:text-dark-primary font-semibold">Zero WhatsApp / SMS Message Texts</strong>
                <span className="text-[11px] text-content-secondary dark:text-dark-secondaryText">Phone numbers, names, and OTPs are masked and wiped immediately.</span>
              </div>
            </li>
            <li className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <EyeOff className="w-4 h-4 text-status-danger flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-content-primary dark:text-dark-primary font-semibold">Zero Camera Frames or Uploaded Photos</strong>
                <span className="text-[11px] text-content-secondary dark:text-dark-secondaryText">QR images are decoded inside your local device browser.</span>
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* Deep Dive: How Salted Hashes Work in Plain Language */}
      <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card space-y-3">
        <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-brand-teal" />
          <span>How Salted Hashes Protect You in Simple Terms</span>
        </h3>
        <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
          A standard hash function can sometimes be reversed if an attacker pre-computes billions of common web addresses (called a "rainbow table"). To make this impossible, QR Shield uses a secret <strong>server-side salt key</strong>. Even if someone breached our database, it is mathematically impossible to turn the hash back into your link, phone number, or text message.
        </p>

        <div className="p-3.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary font-mono text-[11px] text-content-secondary dark:text-dark-secondaryText space-y-1 border border-border dark:border-dark-border">
          <p className="text-brand-teal font-semibold">// Cryptographic transformation before storage:</p>
          <p className="text-content-primary dark:text-dark-primary">stored_hash = HMAC_SHA256(raw_input, server_secret_salt)</p>
          <p className="text-status-success font-semibold">// Raw input is wiped from system memory immediately</p>
        </div>
      </div>

      {/* Danger Zone: Delete My Data (Right to Erasure) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-status-danger-border dark:border-status-danger/30 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-status-danger flex items-center space-x-1.5">
              <Trash2 className="w-4 h-4" />
              <span>Right to Erasure (GDPR / CCPA Compliant)</span>
            </h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText">
              Permanently delete all historical scan records and your user profile from our database.
            </p>
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 rounded-lg bg-status-danger-bg hover:bg-status-danger text-status-danger hover:text-white border border-status-danger-border text-xs font-semibold transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Data</span>
            </button>
          ) : (
            <span className="text-xs text-content-muted dark:text-dark-muted font-mono italic">
              Guest scans are not attached to any account profile.
            </span>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-dark-surface border border-status-danger-border p-6 space-y-4 shadow-modal">
            <div className="w-10 h-10 rounded-xl bg-status-danger-bg text-status-danger flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 id="modal-title" className="text-base font-bold text-content-primary dark:text-dark-primary">
                Confirm Permanent Data Erasure
              </h3>
              <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
                This action cannot be undone. All your scan history, telemetry hashes, and account credentials will be permanently erased from Supabase.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-xs font-semibold text-content-primary dark:text-dark-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-status-danger hover:opacity-90 text-white text-xs font-semibold shadow-subtle transition-opacity disabled:opacity-50"
              >
                {deleting ? 'Erasing...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

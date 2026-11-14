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
  FileCode
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
          <Lock className="w-3.5 h-3.5" />
          <span>Zero-Knowledge Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-dark-text tracking-tight">
          Privacy Center & Trust Engine
        </h1>
        <p className="text-xs sm:text-sm text-dark-muted">
          We built QR Shield on a fundamental promise: we never become the honeypot of the very scams we help you detect.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium">
          {successMsg}
        </div>
      )}

      {/* Two-Column Comparison: What We Store vs What We Never Store */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Column 1: What We Store */}
        <div className="p-6 rounded-2xl bg-dark-surface border border-emerald-500/30 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">What We Store</h3>
          </div>
          <p className="text-xs text-dark-muted leading-relaxed">
            Only non-reversible mathematical artifacts and aggregate telemetry necessary to run rate limits and community protection:
          </p>

          <ul className="space-y-3 text-xs text-dark-text font-mono">
            <li className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-dark-elevated">
              <KeyRound className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-dark-text font-sans">Salted HMAC-SHA-256 Hashes</strong>
                <span className="text-[11px] text-dark-muted font-sans">One-way cryptographic fingerprint of the scanned text.</span>
              </div>
            </li>
            <li className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-dark-elevated">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-dark-text font-sans">Categorical Verdict & Risk Score</strong>
                <span className="text-[11px] text-dark-muted font-sans">"Dangerous", "Suspicious", or "Safe" + numeric score (0-100).</span>
              </div>
            </li>
            <li className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-dark-elevated">
              <Database className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-dark-text font-sans">Community Domain Blacklist Hashes</strong>
                <span className="text-[11px] text-dark-muted font-sans">Domain-level hashes reported to protect other users.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Column 2: What We Never Store */}
        <div className="p-6 rounded-2xl bg-dark-surface border border-rose-500/30 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-rose-400">
            <XCircle className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">What We NEVER Store</h3>
          </div>
          <p className="text-xs text-dark-muted leading-relaxed">
            No raw user data ever touches persistent storage or server logs under any circumstances:
          </p>

          <ul className="space-y-3 text-xs text-dark-text font-mono">
            <li className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-dark-elevated">
              <EyeOff className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-dark-text font-sans">Zero Raw URLs or Paths</strong>
                <span className="text-[11px] text-dark-muted font-sans">Any sensitive tokens or query params are discarded in memory.</span>
              </div>
            </li>
            <li className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-dark-elevated">
              <EyeOff className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-dark-text font-sans">Zero WhatsApp / SMS / Email Text</strong>
                <span className="text-[11px] text-dark-muted font-sans">Phone numbers, names, and OTPs are masked in memory and purged.</span>
              </div>
            </li>
            <li className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-dark-elevated">
              <EyeOff className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-dark-text font-sans">Zero Camera Frames or Images</strong>
                <span className="text-[11px] text-dark-muted font-sans">QR matrixes are decoded client-side inside your browser sandbox.</span>
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* Deep Dive: How Salted Hashes Work */}
      <div className="p-6 sm:p-8 rounded-2xl bg-dark-surface border border-dark-border space-y-4">
        <h3 className="text-base font-bold text-dark-text tracking-tight flex items-center space-x-2">
          <FileCode className="w-5 h-5 text-brand-indigo" />
          <span>Cryptographic Guarantees: Salted HMAC-SHA-256</span>
        </h3>
        <p className="text-xs text-dark-muted leading-relaxed">
          Standard SHA-256 hashes of predictable strings can sometimes be reversed using precomputed rainbow tables. To eliminate this vector, QR Shield uses <strong>keyed HMAC with a secret server-side salt</strong> (<code className="text-brand-cyan font-mono">HASH_SALT</code>). Even if an adversary accessed the hash table, it is mathematically infeasible to reconstruct your links, phone numbers, or private messages.
        </p>

        <div className="p-4 rounded-xl bg-dark-elevated font-mono text-[11px] text-dark-muted space-y-1 border border-dark-border/60 overflow-x-auto">
          <p className="text-brand-cyan">// One-way transform applied before database writes:</p>
          <p className="text-dark-text">stored_hash = HMAC_SHA256(raw_input, server_secret_salt)</p>
          <p className="text-emerald-400">// Raw input variable is discarded immediately from memory</p>
        </div>
      </div>

      {/* Danger Zone: Delete My Data */}
      <div className="p-6 rounded-2xl bg-dark-surface border border-rose-500/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-2">
              <Trash2 className="w-4 h-4" />
              <span>Right to Erasure (GDPR / CCPA Compliant)</span>
            </h3>
            <p className="text-xs text-dark-muted">
              Permanently delete all historical scan records and your user profile from our database.
            </p>
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete My Data</span>
            </button>
          ) : (
            <span className="text-xs text-dark-muted font-mono italic">
              Guest scans are not associated with any account identity.
            </span>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-dark-surface border border-rose-500/40 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-dark-text">Permanent Data Erasure</h3>
              <p className="text-xs text-dark-muted">
                This action is irreversible. All your scan history, telemetry hashes, and account credentials will be permanently erased.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-dark-elevated border border-dark-border text-xs font-semibold text-dark-text"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
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

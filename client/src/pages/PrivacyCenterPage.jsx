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
  Fingerprint,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import PageHeader from '../components/layout/PageHeader';
import usePageTitle from '../hooks/usePageTitle';

export default function PrivacyCenterPage() {
  usePageTitle('Privacy Center');
  const { user, isAuthenticated, deleteMyData } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Interactive Live Hash Demonstrator State
  const [demoInput, setDemoInput] = useState('https://suspicious-paytm-login.xyz/auth');
  const [demoHash, setDemoHash] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);

  // Compute standard client-side SHA-256 for live demonstration
  React.useEffect(() => {
    async function computeHash() {
      if (!demoInput) {
        setDemoHash('');
        return;
      }
      try {
        const msgBuffer = new TextEncoder().encode(demoInput);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setDemoHash(hashHex);
      } catch (e) {
        setDemoHash('0x4e8a...crypto_unavailable');
      }
    }
    computeHash();
  }, [demoInput]);

  const handleCopyHash = () => {
    if (!demoHash) return;
    navigator.clipboard.writeText(demoHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyData();
      setShowConfirmModal(false);
      setSuccessMsg('Your account and all associated scan history have been permanently purged.');
    } catch (err) {
      setDeleteError(err.response?.data?.error || err.message || 'Failed to delete data. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* 1. Header with Privacy Badge */}
      <PageHeader
        title="Privacy Center"
        description="'Zero-knowledge' here means we store no raw URLs, messages or images - only keyed hashes."
        right={
          <Badge variant="teal" size="sm" dot>
            Zero-Knowledge Active
          </Badge>
        }
      />

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-status-success-bg border border-status-success-border text-status-success text-xs text-center font-medium">
          {successMsg}
        </div>
      )}

      {/* 2. Who else sees what you scan */}
      <Card padding="md" className="space-y-3">
        <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary flex items-center space-x-2">
          <EyeOff className="w-4 h-4 text-brand-teal" />
          <span>Who else sees what you scan</span>
        </h3>
        <ul className="space-y-2 text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal flex-shrink-0 mt-1.5" />
            <span><strong>Google Gemini:</strong> receives the scanned content (phone numbers and emails masked) for AI analysis.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal flex-shrink-0 mt-1.5" />
            <span><strong>thum.io & WordPress mshots:</strong> receive the destination URL (credentials removed) only when you tap Preview.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal flex-shrink-0 mt-1.5" />
            <span><strong>Nothing else:</strong> is sent to third parties. All QR decoding and signal calculations execute locally in your browser.</span>
          </li>
        </ul>
      </Card>

      {/* 3. Interactive Zero-Knowledge Hash Demonstrator */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border dark:border-dark-border">
          <div className="flex items-center space-x-2">
            <Fingerprint className="w-4 h-4 text-brand-teal" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-content-primary dark:text-dark-primary font-mono">
              Illustration: plain SHA-256. Our server adds a secret key (HMAC), so real stored hashes differ.
            </h3>
          </div>
          <Badge variant="teal" size="xs">Interactive Test</Badge>
        </div>

        <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
          Type any link, message, or phone number below. Watch the irreversible cryptographic fingerprint calculate in your browser. This 64-character hash is all our telemetry database ever records.
        </p>

        <div className="space-y-3 pt-1">
          <div>
            <label className="text-[11px] font-semibold text-content-muted dark:text-dark-muted uppercase font-mono block mb-1">
              Sample Input Text / URL (Simulated Raw Input):
            </label>
            <input
              type="text"
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              placeholder="Enter any text to see its one-way hash..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-base sm:text-sm font-mono text-content-primary dark:text-dark-primary focus:outline-none focus:border-brand-teal"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-content-muted dark:text-dark-muted uppercase font-mono block">
                Resulting SHA-256 Cryptographic Fingerprint:
              </label>
              <button
                type="button"
                onClick={handleCopyHash}
                className="text-[11px] font-mono text-brand-teal hover:underline flex items-center space-x-1"
              >
                {copiedHash ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border font-mono text-xs text-brand-teal break-all">
              {demoHash || 'Enter text above to compute fingerprint...'}
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Two-Column Comparison: What We Store vs What We Never Store */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Column 1: What We Store */}
        <Card padding="md" className="border-status-success-border/60 dark:border-status-success/30 space-y-4">
          <div className="flex items-center space-x-2 text-status-success">
            <CheckCircle2 className="w-4.5 h-4.5" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono">What We Store</h3>
          </div>
          <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
            Only non-reversible mathematical fingerprints and categorical scores required for rate limits and telemetry:
          </p>

          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <KeyRound className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-content-primary dark:text-dark-primary font-semibold">Salted HMAC-SHA-256 Hashes</strong>
                <span className="text-[11px] text-content-secondary dark:text-dark-secondaryText">One-way cryptographic fingerprint of the scanned text.</span>
              </div>
            </li>
            <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <ShieldCheck className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-content-primary dark:text-dark-primary font-semibold">Verdict & Numeric Risk Score</strong>
                <span className="text-[11px] text-content-secondary dark:text-dark-secondaryText">"Safe", "Suspicious", or "Dangerous" + numeric risk level (0–100).</span>
              </div>
            </li>
            <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <Database className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-content-primary dark:text-dark-primary font-semibold">Community Blacklist Domain Hashes</strong>
                <span className="text-[11px] text-content-secondary dark:text-dark-secondaryText">Domain hashes reported by users to shield the wider community.</span>
              </div>
            </li>
          </ul>
        </Card>

        {/* Column 2: What We Never Store */}
        <Card padding="md" className="border-status-danger-border/60 dark:border-status-danger/30 space-y-4">
          <div className="flex items-center space-x-2 text-status-danger">
            <XCircle className="w-4.5 h-4.5" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono">What We NEVER Store</h3>
          </div>
          <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
            No private user communications or media ever touch persistent disk storage:
          </p>

          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <EyeOff className="w-4 h-4 text-status-danger flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-content-primary dark:text-dark-primary font-semibold">Zero Raw URLs or Auth Tokens</strong>
                <span className="text-[11px] text-content-secondary dark:text-dark-secondaryText">Sensitive link tokens and full paths are discarded in memory.</span>
              </div>
            </li>
            <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <EyeOff className="w-4 h-4 text-status-danger flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-content-primary dark:text-dark-primary font-semibold">Zero WhatsApp / SMS Message Texts</strong>
                <span className="text-[11px] text-content-secondary dark:text-dark-secondaryText">Phone numbers, names, and OTPs are masked and wiped immediately.</span>
              </div>
            </li>
            <li className="flex items-start space-x-2.5 p-3 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
              <EyeOff className="w-4 h-4 text-status-danger flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-content-primary dark:text-dark-primary font-semibold">Zero Camera Frames or Photos</strong>
                <span className="text-[11px] text-content-secondary dark:text-dark-secondaryText">QR images are decoded inside your local device browser.</span>
              </div>
            </li>
          </ul>
        </Card>

      </div>

      {/* 5. Deep Dive: How Salted Hashes Work in Plain Language */}
      <Card padding="md" className="space-y-3">
        <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-brand-teal" />
          <span>How Salted Hashes Protect You in Simple Terms</span>
        </h3>
        <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
          A standard hash function can sometimes be reversed if an attacker pre-computes billions of common web addresses (called a "rainbow table"). To make this impossible, QR Shield uses a secret <strong>server-side salt key</strong>. Even if someone breached our database, it is mathematically impossible to turn the hash back into your link, phone number, or text message.
        </p>

        <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary font-mono text-[11px] text-content-secondary dark:text-dark-secondaryText space-y-1 border border-border dark:border-dark-border">
          <p className="text-brand-teal font-semibold">// Cryptographic transformation before storage:</p>
          <p className="text-content-primary dark:text-dark-primary">stored_hash = HMAC_SHA256(raw_input, server_secret_salt)</p>
          <p className="text-status-success font-semibold">// Raw input is wiped from system memory immediately</p>
        </div>
      </Card>

      {/* 6. Danger Zone: Delete My Data (Right to Erasure) */}
      <Card padding="md" className="border-status-danger-border/60 dark:border-status-danger/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-status-danger flex items-center space-x-1.5 font-mono">
              <Trash2 className="w-4 h-4" />
              <span>Right to Erasure</span>
            </h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText">
              Permanently delete all historical scan records and your user profile from our database.
            </p>
          </div>

          {isAuthenticated ? (
            <Button
              size="sm"
              variant="danger"
              icon={Trash2}
              onClick={() => {
                setDeleteError(null);
                setShowConfirmModal(true);
              }}
            >
              Delete My Data
            </Button>
          ) : (
            <span className="text-xs text-content-muted dark:text-dark-muted font-mono italic">
              Guest scans are not attached to any account profile.
            </span>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Permanent Data Erasure"
        description="This action cannot be undone. All your scan history, telemetry hashes, and account credentials will be permanently erased."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="p-3 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger text-xs">
              {deleteError}
            </div>
          )}

          <div className="p-3 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger text-xs space-y-1">
            <p className="font-semibold flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Permanent Deletion Notice</span>
            </p>
            <p className="text-[11px] leading-relaxed">
              Upon confirmation, our backend executes a cascading delete purging your user ID, audit logs, and scan history and account record.
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="dangerSolid"
              className="flex-1"
              loading={deleting}
              onClick={handleDelete}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Link2, 
  MessageSquare, 
  ClipboardPaste, 
  ArrowRight, 
  AlertCircle,
  Info,
  Check
} from 'lucide-react';
import api from '../api/client';
import QrScanner from '../components/scan/QrScanner';
import ScanProgress from '../components/scan/ScanProgress';
import VerdictCard from '../components/scan/VerdictCard';

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'link' | 'message'
  const [urlInput, setUrlInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [pastedNotice, setPastedNotice] = useState(false);

  // Quick clipboard paste
  const handlePasteClipboard = async (targetType) => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      if (targetType === 'link') {
        setUrlInput(text);
      } else {
        setMessageInput(text);
      }
      setPastedNotice(true);
      setTimeout(() => setPastedNotice(false), 2000);
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  // Run link scan
  const handleScanLink = async (urlToScan = urlInput) => {
    const trimmed = urlToScan.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a valid URL to scan.');
      return;
    }
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const res = await api.post('/scan/link', { url: trimmed });
      setScanResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to analyze URL. Please check connection and try again.';
      setErrorMsg(msg);
    } finally {
      setIsScanning(false);
    }
  };

  // Run QR scan (from camera decode or image upload)
  const handleScanQr = async (decodedText) => {
    if (!decodedText || !decodedText.trim()) return;
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const res = await api.post('/scan/qr', { content: decodedText.trim() });
      setScanResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to analyze QR code content.';
      setErrorMsg(msg);
    } finally {
      setIsScanning(false);
    }
  };

  // Run message scan
  const handleScanMessage = async (msgToScan = messageInput) => {
    const trimmed = msgToScan.trim();
    if (!trimmed) {
      setErrorMsg('Please enter or paste a message to analyze.');
      return;
    }
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const res = await api.post('/scan/message', { message: trimmed });
      setScanResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to scan message. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsScanning(false);
    }
  };

  const handleResetScan = () => {
    setScanResult(null);
    setErrorMsg(null);
    setUrlInput('');
    setMessageInput('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary dark:text-dark-primary tracking-tight">
          Security Threat Scanner
        </h1>
        <p className="text-xs sm:text-sm text-content-secondary dark:text-dark-secondaryText max-w-lg mx-auto">
          Scan a QR code, test a web link, or check an urgent message.
        </p>
      </div>

      {/* Main Scanner Workspace */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {scanResult ? (
            <VerdictCard
              key="verdict"
              result={scanResult}
              onScanAnother={handleResetScan}
            />
          ) : isScanning ? (
            <motion.div
              key="progress"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-8 rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card"
            >
              <ScanProgress inputType={activeTab} />
            </motion.div>
          ) : (
            <motion.div
              key="scanner-box"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card space-y-6"
            >
              {/* Tab Selector: QR | Link | Message */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => { setActiveTab('qr'); setErrorMsg(null); }}
                  className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'qr'
                      ? 'bg-white dark:bg-dark-surface text-brand-teal shadow-subtle'
                      : 'text-content-secondary dark:text-dark-secondaryText hover:text-content-primary'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('link'); setErrorMsg(null); }}
                  className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'link'
                      ? 'bg-white dark:bg-dark-surface text-brand-teal shadow-subtle'
                      : 'text-content-secondary dark:text-dark-secondaryText hover:text-content-primary'
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  <span>Web Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('message'); setErrorMsg(null); }}
                  className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'message'
                      ? 'bg-white dark:bg-dark-surface text-brand-teal shadow-subtle'
                      : 'text-content-secondary dark:text-dark-secondaryText hover:text-content-primary'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </button>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-center space-x-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* TAB 1: QR CODE */}
              {activeTab === 'qr' && (
                <div className="space-y-4">
                  <QrScanner onScan={handleScanQr} isScanning={isScanning} />
                </div>
              )}

              {/* TAB 2: LINK CHECKER */}
              {activeTab === 'link' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-content-primary dark:text-dark-primary">
                        Enter Website Address or Shortened Link
                      </label>
                      <button
                        type="button"
                        onClick={() => handlePasteClipboard('link')}
                        className="flex items-center space-x-1 text-xs text-brand-teal hover:underline font-medium transition-colors"
                      >
                        {pastedNotice ? <Check className="w-3.5 h-3.5 text-status-success" /> : <ClipboardPaste className="w-3.5 h-3.5" />}
                        <span>{pastedNotice ? 'Pasted!' : 'Paste from clipboard'}</span>
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleScanLink()}
                        placeholder="https://example.com or bit.ly/..."
                        className="w-full px-4 py-3 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-content-primary dark:text-dark-primary placeholder:text-content-muted font-mono text-sm focus:outline-none focus:border-brand-teal pr-28 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => handleScanLink()}
                        disabled={!urlInput.trim()}
                        className="absolute right-1.5 px-4 py-2 rounded-md bg-brand-teal hover:bg-brand-teal-hover text-white font-semibold text-xs shadow-subtle disabled:opacity-50 transition-colors flex items-center space-x-1"
                      >
                        <span>Check Link</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-content-muted dark:text-dark-muted">
                    Expands shortened redirects server-side (up to 5 hops) with loopback & private IP SSRF prevention.
                  </p>
                </div>
              )}

              {/* TAB 3: MESSAGE SCANNER */}
              {activeTab === 'message' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-content-primary dark:text-dark-primary">
                        Paste Full Text Message (WhatsApp, SMS, Telegram, Email)
                      </label>
                      <button
                        type="button"
                        onClick={() => handlePasteClipboard('message')}
                        className="flex items-center space-x-1 text-xs text-brand-teal hover:underline font-medium transition-colors"
                      >
                        {pastedNotice ? <Check className="w-3.5 h-3.5 text-status-success" /> : <ClipboardPaste className="w-3.5 h-3.5" />}
                        <span>{pastedNotice ? 'Pasted!' : 'Paste from clipboard'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <textarea
                        rows={5}
                        maxLength={5000}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Paste suspicious text message here to check for urgency coercion, fake KYC alerts, or OTP theft..."
                        className="w-full p-3.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-content-primary dark:text-dark-primary placeholder:text-content-muted text-xs sm:text-sm focus:outline-none focus:border-brand-teal transition-colors"
                      ></textarea>
                      <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-content-muted dark:text-dark-muted">
                        {messageInput.length} / 5,000
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <span className="text-[11px] text-content-muted dark:text-dark-muted flex items-center space-x-1">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Phone numbers and names are masked in memory prior to analysis.</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleScanMessage()}
                      disabled={!messageInput.trim()}
                      className="px-5 py-2.5 rounded-lg bg-brand-teal hover:bg-brand-teal-hover text-white font-semibold text-xs shadow-subtle disabled:opacity-50 transition-colors flex items-center justify-center space-x-1.5 self-end sm:self-auto"
                    >
                      <span>Analyze Message</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

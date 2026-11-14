import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Link2, 
  MessageSquare, 
  ClipboardPaste, 
  ArrowRight, 
  AlertCircle,
  Info
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
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  // Run link scan
  const handleScanLink = async (urlToScan = urlInput) => {
    if (!urlToScan.trim()) return;
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const res = await api.post('/scan/link', { url: urlToScan.trim() });
      setScanResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to scan URL. Please try again.';
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
    if (!msgToScan.trim()) return;
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const res = await api.post('/scan/message', { message: msgToScan.trim() });
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-dark-text tracking-tight">
          Live Threat Scanner
        </h1>
        <p className="text-xs sm:text-sm text-dark-muted max-w-lg mx-auto">
          Scan physical QR codes, inspect URLs, or analyze suspicious WhatsApp & SMS messages in real time without storing raw data.
        </p>
      </div>

      {/* Main Scanner Container or Result View */}
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
              className="p-8 rounded-2xl bg-dark-surface border border-dark-border"
            >
              <ScanProgress inputType={activeTab} />
            </motion.div>
          ) : (
            <motion.div
              key="scanner-box"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 sm:p-8 rounded-3xl bg-dark-surface border border-dark-border shadow-xl space-y-6"
            >
              {/* Tab Selector: QR | Link | Message */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-dark-elevated border border-dark-border/80">
                <button
                  type="button"
                  onClick={() => { setActiveTab('qr'); setErrorMsg(null); }}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'qr'
                      ? 'bg-dark-surface text-brand-cyan shadow-sm border border-brand-indigo/30'
                      : 'text-dark-muted hover:text-dark-text'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Scan QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('link'); setErrorMsg(null); }}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'link'
                      ? 'bg-dark-surface text-brand-cyan shadow-sm border border-brand-indigo/30'
                      : 'text-dark-muted hover:text-dark-text'
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  <span>Check Link / URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('message'); setErrorMsg(null); }}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'message'
                      ? 'bg-dark-surface text-brand-cyan shadow-sm border border-brand-indigo/30'
                      : 'text-dark-muted hover:text-dark-text'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Analyze Message</span>
                </button>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
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
                      <label className="text-xs font-semibold text-dark-muted">
                        Enter any website URL or shortened link to verify
                      </label>
                      <button
                        type="button"
                        onClick={() => handlePasteClipboard('link')}
                        className="flex items-center space-x-1 text-xs text-brand-indigo hover:text-brand-cyan font-medium transition-colors"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5" />
                        <span>Paste from clipboard</span>
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleScanLink()}
                        placeholder="https://example.com or bit.ly/..."
                        className="w-full px-4 py-3.5 rounded-xl bg-dark-elevated border border-dark-border text-dark-text placeholder:text-dark-muted/60 font-mono text-sm focus:outline-none focus:border-brand-indigo pr-28 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => handleScanLink()}
                        disabled={!urlInput.trim()}
                        className="absolute right-2 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-indigo to-brand-dark text-white font-bold text-xs shadow-glow hover:opacity-95 disabled:opacity-50 transition-all flex items-center space-x-1"
                      >
                        <span>Scan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-dark-muted">
                    Follows redirects safely with loopback & private IP SSRF prevention.
                  </p>
                </div>
              )}

              {/* TAB 3: MESSAGE SCANNER */}
              {activeTab === 'message' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-dark-muted">
                        Paste received message from WhatsApp, SMS, Telegram, or Email
                      </label>
                      <button
                        type="button"
                        onClick={() => handlePasteClipboard('message')}
                        className="flex items-center space-x-1 text-xs text-brand-indigo hover:text-brand-cyan font-medium transition-colors"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5" />
                        <span>Paste from clipboard</span>
                      </button>
                    </div>

                    <textarea
                      rows={5}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Paste suspicious text message here to check for urgency coercion, fake KYC alerts, or OTP theft..."
                      className="w-full p-4 rounded-xl bg-dark-elevated border border-dark-border text-dark-text placeholder:text-dark-muted/60 text-sm focus:outline-none focus:border-brand-indigo transition-colors"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-dark-muted flex items-center space-x-1">
                      <Info className="w-3.5 h-3.5" />
                      <span>Phone numbers and names are masked prior to AI evaluation.</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleScanMessage()}
                      disabled={!messageInput.trim()}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-dark text-white font-bold text-xs shadow-glow hover:opacity-95 disabled:opacity-50 transition-all flex items-center space-x-1.5"
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

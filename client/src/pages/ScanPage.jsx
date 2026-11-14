import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Link2, 
  MessageSquare, 
  ClipboardPaste, 
  ArrowRight, 
  AlertCircle,
  Info,
  Check,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Globe,
  SlidersHorizontal
} from 'lucide-react';
import api from '../api/client';
import QrScanner from '../components/scan/QrScanner';
import ScanProgress from '../components/scan/ScanProgress';
import VerdictCard from '../components/scan/VerdictCard';
import SampleCards, { SAMPLES } from '../components/scan/SampleCards';
import Tabs from '../components/common/Tabs';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'link' | 'message'
  const [urlInput, setUrlInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [pastedNotice, setPastedNotice] = useState(false);

  const tabsConfig = [
    { id: 'qr', label: 'QR Code', icon: QrCode },
    { id: 'link', label: 'Web Link', icon: Link2 },
    { id: 'message', label: 'Message / SMS', icon: MessageSquare }
  ];

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
      setErrorMsg('Please enter a valid URL or IP address to scan.');
      return;
    }
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const res = await api.post('/scan/link', { url: trimmed });
      const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      setScanResult({
        ...res.data,
        targetUrl: res.data.targetUrl || res.data.finalUrl || normalized,
        finalUrl: res.data.finalUrl || normalized,
        domain: res.data.domain || normalized.replace(/^https?:\/\//i, '').split('/')[0]
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to analyze URL. Please check your internet connection.';
      setErrorMsg(msg);
    } finally {
      setIsScanning(false);
    }
  };

  // Run QR scan (from camera decode or image upload)
  const handleScanQr = async (decodedText) => {
    if (!decodedText || !decodedText.trim()) return;
    const trimmed = decodedText.trim();
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const res = await api.post('/scan/qr', { content: trimmed });
      // Extract URL if present in decoded QR string
      let rawUrl = null;
      if (/^https?:\/\//i.test(trimmed)) {
        rawUrl = trimmed;
      } else if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(trimmed)) {
        rawUrl = 'https://' + trimmed;
      } else {
        const urlMatch = trimmed.match(/https?:\/\/[^\s]+/i);
        if (urlMatch) rawUrl = urlMatch[0];
      }

      setScanResult({
        ...res.data,
        scannedContent: trimmed,
        targetUrl: res.data.targetUrl || res.data.finalUrl || rawUrl,
        finalUrl: res.data.finalUrl || rawUrl,
        domain: res.data.domain || (rawUrl ? rawUrl.replace(/^https?:\/\//i, '').split('/')[0] : undefined)
      });
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
      const urlMatch = trimmed.match(/https?:\/\/[^\s]+/i);
      setScanResult({
        ...res.data,
        targetUrl: res.data.targetUrl || res.data.finalUrl || (urlMatch ? urlMatch[0] : undefined),
        finalUrl: res.data.finalUrl || (urlMatch ? urlMatch[0] : undefined),
        domain: res.data.domain || (urlMatch ? urlMatch[0].replace(/^https?:\/\//i, '').split('/')[0] : undefined)
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to scan message. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle benchmark sample click
  const handleSelectSample = (sample) => {
    setErrorMsg(null);
    if (sample.type === 'qr') {
      setActiveTab('qr');
      handleScanQr(sample.content);
    } else if (sample.type === 'link') {
      setActiveTab('link');
      setUrlInput(sample.content);
      handleScanLink(sample.content);
    } else if (sample.type === 'message') {
      setActiveTab('message');
      setMessageInput(sample.content);
      handleScanMessage(sample.content);
    }
  };

  // Auto-load benchmark if navigated from Awareness Page
  const location = useLocation();
  useEffect(() => {
    if (location.state?.sample) {
      handleSelectSample(location.state.sample);
    }
  }, [location.state]);

  const handleResetScan = () => {
    setScanResult(null);
    setErrorMsg(null);
    setUrlInput('');
    setMessageInput('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* 1. Page Header with Status Chip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border dark:border-dark-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-content-primary dark:text-dark-primary tracking-tight">
            Threat Scanner & Inspector
          </h1>
          <p className="text-xs text-content-secondary dark:text-dark-secondaryText mt-0.5">
            Real-time heuristic & AI verification with SSRF containment and zero raw storage.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="teal" size="sm" dot>SSRF Firewall Ready</Badge>
        </div>
      </div>

      {/* 2. Main Scanner Workspace */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {scanResult ? (
            <VerdictCard
              key="verdict"
              result={scanResult}
              onScanAnother={handleResetScan}
            />
          ) : isScanning ? (
            <Card key="progress" padding="lg">
              <ScanProgress inputType={activeTab} />
            </Card>
          ) : (
            <Card key="scanner-box" padding="md" className="space-y-6">
              
              {/* Segmented Mode Switcher */}
              <div className="flex items-center justify-center">
                <Tabs
                  tabs={tabsConfig}
                  activeTab={activeTab}
                  onChange={(tabId) => {
                    setActiveTab(tabId);
                    setErrorMsg(null);
                  }}
                  size="md"
                />
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMsg(null)}
                    className="text-status-danger hover:underline text-[11px] font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* TAB 1: QR CODE SCANNER */}
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
                        className="w-full px-4 py-3 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-content-primary dark:text-dark-primary placeholder:text-content-muted font-mono text-xs sm:text-sm focus:outline-none focus:border-brand-teal pr-28 transition-colors"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        icon={ArrowRight}
                        iconPosition="right"
                        onClick={() => handleScanLink()}
                        disabled={!urlInput.trim()}
                        className="absolute right-1.5"
                      >
                        Check Link
                      </Button>
                    </div>
                  </div>

                  <p className="text-[11px] text-content-muted dark:text-dark-muted font-mono flex items-center space-x-1.5">
                    <Info className="w-3 h-3 text-brand-teal flex-shrink-0" />
                    <span>Expands redirects up to 5 hops with strict private IP (RFC 1918) & cloud metadata blocking.</span>
                  </p>
                </div>
              )}

              {/* TAB 3: MESSAGE SCANNER */}
              {activeTab === 'message' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-content-primary dark:text-dark-primary">
                        Paste Full Text Message (WhatsApp, SMS, Telegram)
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
                        className="w-full p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-content-primary dark:text-dark-primary placeholder:text-content-muted text-xs sm:text-sm focus:outline-none focus:border-brand-teal transition-colors"
                      />
                      <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-content-muted dark:text-dark-muted">
                        {messageInput.length} / 5,000
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <span className="text-[11px] text-content-muted dark:text-dark-muted flex items-center space-x-1.5">
                      <Info className="w-3.5 h-3.5 text-brand-teal flex-shrink-0" />
                      <span>Phone numbers and names are masked in memory prior to analysis.</span>
                    </span>

                    <Button
                      size="sm"
                      variant="primary"
                      icon={ArrowRight}
                      iconPosition="right"
                      onClick={() => handleScanMessage()}
                      disabled={!messageInput.trim()}
                      className="self-end sm:self-auto"
                    >
                      Analyze Message
                    </Button>
                  </div>
                </div>
              )}

            </Card>
          )}
        </AnimatePresence>
      </div>

      {/* 3. One-Click Benchmark Testing Bar */}
      {!scanResult && !isScanning && (
        <SampleCards onSelectSample={handleSelectSample} />
      )}

    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Share2 } from 'lucide-react';
import api from '../api/client';
import VerdictCard from '../components/scan/VerdictCard';
import ScanProgress from '../components/scan/ScanProgress';

export default function ShareTargetPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const title = searchParams.get('title') || '';
    const text = searchParams.get('text') || '';
    const url = searchParams.get('url') || '';

    const payload = (url || text || title).trim();

    if (!payload) {
      setErrorMsg('No content received from share target.');
      setIsScanning(false);
      return;
    }

    const processSharedContent = async () => {
      setIsScanning(true);
      setErrorMsg(null);

      // Auto-detect: if explicit URL or starts with http
      const isUrl = url || /^https?:\/\//i.test(payload) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i.test(payload);

      try {
        if (isUrl) {
          const res = await api.post('/scan/link', { url: url || payload });
          setScanResult(res.data);
        } else {
          const res = await api.post('/scan/message', { message: payload });
          setScanResult(res.data);
        }
      } catch (err) {
        console.error('Share scan error:', err);
        setErrorMsg(err.response?.data?.error || 'Failed to scan shared content.');
      } finally {
        setIsScanning(false);
      }
    };

    processSharedContent();
  }, [searchParams]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center space-x-2 text-xs font-mono text-brand-cyan uppercase tracking-wider">
        <Share2 className="w-4 h-4" />
        <span>PWA Web Share Target Receiver</span>
      </div>

      {isScanning && (
        <div className="p-8 rounded-2xl bg-dark-surface border border-dark-border">
          <ScanProgress inputType="link" />
        </div>
      )}

      {errorMsg && (
        <div className="p-6 rounded-2xl bg-dark-surface border border-rose-500/30 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-dark-text">Unable to Process Share</h3>
          <p className="text-xs text-dark-muted">{errorMsg}</p>
          <button
            onClick={() => navigate('/scan')}
            className="px-6 py-2.5 rounded-xl bg-brand-indigo text-white text-xs font-bold shadow-glow"
          >
            Go to Scanner
          </button>
        </div>
      )}

      {scanResult && (
        <VerdictCard
          result={scanResult}
          onScanAnother={() => navigate('/scan')}
        />
      )}
    </div>
  );
}

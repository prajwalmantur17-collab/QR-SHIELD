import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Share2, ArrowRight } from 'lucide-react';
import api from '../api/client';
import VerdictCard from '../components/scan/VerdictCard';
import ScanProgress from '../components/scan/ScanProgress';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import PageHeader from '../components/layout/PageHeader';
import usePageTitle from '../hooks/usePageTitle';

export default function ShareTargetPage() {
  usePageTitle('Quick Share Target');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isScanning, setIsScanning] = useState(false);
  const [emptyPayload, setEmptyPayload] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const title = searchParams.get('title') || '';
    const text = searchParams.get('text') || '';
    const url = searchParams.get('url') || '';

    const payload = (url || text || title).trim();

    if (!payload) {
      setEmptyPayload(true);
      setIsScanning(false);
      setErrorMsg(null);
      return;
    }

    setEmptyPayload(false);

    const processSharedContent = async () => {
      setIsScanning(true);
      setErrorMsg(null);

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
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Threat Scanner"
        description="PWA Web Share Target: inspect shared links and text messages."
        right={
          <Badge variant="teal" size="sm" icon={Share2} dot>
            PWA Share Target
          </Badge>
        }
      />

      {isScanning && (
        <Card padding="lg">
          <ScanProgress inputType="link" />
        </Card>
      )}

      {emptyPayload && !isScanning && (
        <Card padding="lg" className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-canvas-subtle dark:bg-dark-secondary text-brand-teal flex items-center justify-center mx-auto">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">
            Quick Share Target
          </h3>
          <p className="text-xs text-content-secondary dark:text-dark-secondaryText max-w-sm mx-auto leading-relaxed">
            Share a link or text from another app to scan it here
          </p>
          <div className="pt-2">
            <Button
              size="sm"
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/scan')}
            >
              Open Threat Scanner
            </Button>
          </div>
        </Card>
      )}

      {errorMsg && !emptyPayload && (
        <Card padding="lg" className="border-status-danger-border/60 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-status-danger-bg text-status-danger flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">
            Unable to Process Shared Item
          </h3>
          <p className="text-xs text-content-secondary dark:text-dark-secondaryText max-w-sm mx-auto leading-relaxed">
            {errorMsg}
          </p>
          <div className="pt-2">
            <Button
              size="sm"
              variant="primary"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/scan')}
            >
              Open Threat Scanner
            </Button>
          </div>
        </Card>
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

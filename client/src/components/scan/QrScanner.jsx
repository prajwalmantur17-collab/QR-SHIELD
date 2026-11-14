import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, AlertCircle, RefreshCw, Image as ImageIcon, Video, VideoOff, CheckCircle2 } from 'lucide-react';

export default function QrScanner({ onScan, isScanning }) {
  const [mode, setMode] = useState('camera'); // 'camera' | 'upload'
  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const scannerRef = useRef(null);
  const containerId = 'qr-reader-container';

  // Start Camera handler
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
              setIsCameraActive(false);
              onScan(decodedText);
            }).catch(() => {
              onScan(decodedText);
            });
          } else {
            onScan(decodedText);
          }
        },
        () => {}
      );
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera initialization error:', err);
      setCameraError('Camera access unavailable or permission denied. Please allow camera permissions or upload an image.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera handler
  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsCameraActive(false);
      } catch (err) {
        console.error('Error stopping camera:', err);
      }
    }
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [mode]);

  // Handle image file upload with preview
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    try {
      const html5QrCode = new Html5Qrcode('qr-file-dummy');
      const decodedText = await html5QrCode.scanFile(file, true);
      onScan(decodedText);
    } catch (err) {
      console.warn('QR file scan error:', err);
      setFileError('Could not decode a clear QR code from this image. Please ensure the QR code is clearly visible and well-lit.');
    }
  };

  const handleClearPreview = () => {
    setPreviewImage(null);
    setFileError(null);
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle: Camera vs Upload */}
      <div className="flex items-center justify-center space-x-2 pb-2">
        <button
          type="button"
          onClick={() => { setMode('camera'); setFileError(null); }}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
            mode === 'camera'
              ? 'bg-brand-teal text-white border-brand-teal shadow-subtle'
              : 'bg-white dark:bg-dark-surface text-content-secondary dark:text-dark-secondaryText hover:text-content-primary border-border dark:border-dark-border hover:bg-canvas-subtle'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Live Camera</span>
        </button>

        <button
          type="button"
          onClick={() => { setMode('upload'); stopCamera(); }}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
            mode === 'upload'
              ? 'bg-brand-teal text-white border-brand-teal shadow-subtle'
              : 'bg-white dark:bg-dark-surface text-content-secondary dark:text-dark-secondaryText hover:text-content-primary border-border dark:border-dark-border hover:bg-canvas-subtle'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload QR Image</span>
        </button>
      </div>

      {/* Mode 1: Camera Viewfinder */}
      {mode === 'camera' && (
        <div className="space-y-3">
          <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-border dark:border-dark-border flex items-center justify-center shadow-card">
            <div id={containerId} className="w-full h-full"></div>

            {/* Subtle corner reticles */}
            <div className="absolute inset-5 pointer-events-none">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-teal"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-teal"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-teal"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-teal"></div>

              {/* Scanning indicator */}
              {isCameraActive && (
                <div className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-brand-teal to-transparent opacity-80 animate-scanner-beam"></div>
              )}
            </div>

            {/* Camera Permission / Error Fallback */}
            {cameraError && (
              <div className="absolute inset-0 bg-white/95 dark:bg-dark-surface/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-status-warning" />
                <h4 className="text-xs font-bold text-content-primary dark:text-dark-primary">Camera Permission Required</h4>
                <p className="text-xs text-content-secondary dark:text-dark-secondaryText max-w-xs">{cameraError}</p>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border text-xs font-semibold text-content-primary flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-teal text-white text-xs font-semibold shadow-subtle"
                  >
                    Upload Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex items-center justify-center space-x-2 pt-1">
            {isCameraActive ? (
              <button
                type="button"
                onClick={stopCamera}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-content-secondary dark:text-dark-secondaryText hover:text-content-primary text-xs font-medium"
              >
                <VideoOff className="w-3.5 h-3.5 text-status-danger" />
                <span>Pause Camera</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-brand-teal text-xs font-semibold"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Resume Camera</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: File Upload with Image Preview */}
      {mode === 'upload' && (
        <div className="w-full max-w-sm mx-auto space-y-3">
          <div id="qr-file-dummy" className="hidden"></div>

          {previewImage ? (
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border dark:border-dark-border bg-canvas-subtle dark:bg-dark-secondary p-4 flex flex-col items-center justify-center space-y-3">
              <img
                src={previewImage}
                alt="Uploaded QR Code Preview"
                className="max-h-48 max-w-full object-contain rounded-lg shadow-subtle"
              />
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleClearPreview}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-xs font-medium text-content-secondary hover:text-content-primary"
                >
                  Choose Different Image
                </button>
              </div>
            </div>
          ) : (
            <label className="relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-border hover:border-brand-teal rounded-2xl cursor-pointer bg-white dark:bg-dark-surface hover:bg-canvas-subtle/50 transition-colors p-6 text-center group shadow-card">
              <div className="w-12 h-12 rounded-xl bg-brand-teal-subtle text-brand-teal flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-content-primary dark:text-dark-primary mb-1">
                Select or Drop QR Code Image
              </p>
              <p className="text-[11px] text-content-muted dark:text-dark-muted mb-4">
                Supports PNG, JPG, WEBP, or screenshot files
              </p>
              <span className="px-3.5 py-1.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-xs font-semibold text-content-primary dark:text-dark-primary shadow-subtle">
                Browse Files
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          )}

          {fileError && (
            <div className="p-3 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{fileError}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-center text-content-muted dark:text-dark-muted">
        QR codes are decoded securely in your local browser sandbox. Images are never uploaded to remote servers.
      </p>
    </div>
  );
}

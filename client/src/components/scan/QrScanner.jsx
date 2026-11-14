import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';

export default function QrScanner({ onScan, isScanning }) {
  const [mode, setMode] = useState('camera'); // 'camera' | 'upload'
  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  const scannerRef = useRef(null);
  const containerId = 'qr-reader-container';

  useEffect(() => {
    let html5QrCode = null;

    if (mode === 'camera') {
      const startCamera = async () => {
        try {
          setCameraError(null);
          html5QrCode = new Html5Qrcode(containerId);
          scannerRef.current = html5QrCode;

          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          };

          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              // Successfully decoded QR
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
            () => {
              // Frame scan error (ignore normal non-QR frames)
            }
          );
          setIsCameraActive(true);
        } catch (err) {
          console.warn('Camera initialization error:', err);
          setCameraError('Camera access unavailable or permission denied. Please switch to file upload.');
          setIsCameraActive(false);
        }
      };

      startCamera();
    }

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(console.error);
        }
        scannerRef.current = null;
      }
    };
  }, [mode]);

  // Handle image file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    try {
      const html5QrCode = new Html5Qrcode('qr-file-dummy');
      const decodedText = await html5QrCode.scanFile(file, true);
      onScan(decodedText);
    } catch (err) {
      console.warn('QR file scan error:', err);
      setFileError('Could not decode a valid QR code from this image. Please ensure the QR is clear and well-lit.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle: Camera vs Upload */}
      <div className="flex items-center justify-center space-x-2 pb-2">
        <button
          type="button"
          onClick={() => setMode('camera')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            mode === 'camera'
              ? 'bg-brand-indigo text-white border-brand-indigo shadow-glow'
              : 'bg-dark-elevated text-dark-muted hover:text-dark-text border-dark-border'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Live Camera</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            mode === 'upload'
              ? 'bg-brand-indigo text-white border-brand-indigo shadow-glow'
              : 'bg-dark-elevated text-dark-muted hover:text-dark-text border-dark-border'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Camera Viewfinder Mode */}
      {mode === 'camera' && (
        <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-black/60 border border-dark-border flex items-center justify-center">
          <div id={containerId} className="w-full h-full"></div>

          {/* Cyberpunk corner viewfinder reticles */}
          <div className="absolute inset-4 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-cyan"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-cyan"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-cyan"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-cyan"></div>

            {/* Glowing animated scanner line */}
            {isCameraActive && (
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-brand-cyan to-transparent shadow-glow-cyan animate-scanline"></div>
            )}
          </div>

          {/* Camera Permission / Error Fallback */}
          {cameraError && (
            <div className="absolute inset-0 bg-dark-bg/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-verdict-suspicious" />
              <p className="text-xs text-dark-text font-medium">{cameraError}</p>
              <button
                type="button"
                onClick={() => setMode('upload')}
                className="px-4 py-2 rounded-xl bg-brand-indigo text-white text-xs font-bold shadow-glow"
              >
                Use Image Upload Instead
              </button>
            </div>
          )}
        </div>
      )}

      {/* File Upload Mode */}
      {mode === 'upload' && (
        <div className="w-full max-w-sm mx-auto">
          <div id="qr-file-dummy" className="hidden"></div>
          <label className="relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-dark-border hover:border-brand-indigo/60 rounded-2xl cursor-pointer bg-dark-elevated/40 hover:bg-dark-elevated/70 transition-all p-6 text-center group">
            <div className="w-14 h-14 rounded-2xl bg-brand-indigo/15 text-brand-cyan flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-dark-text mb-1">
              Select or Drop QR Code Image
            </p>
            <p className="text-xs text-dark-muted mb-4">
              PNG, JPG, WEBP, or SVG screenshot
            </p>
            <span className="px-4 py-2 rounded-xl bg-dark-surface border border-dark-border text-xs font-semibold text-dark-text shadow-sm">
              Browse Files
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {fileError && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{fileError}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-center text-dark-muted">
        QR codes are decoded entirely in your browser. Raw images are never uploaded.
      </p>
    </div>
  );
}

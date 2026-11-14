import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, AlertCircle, RefreshCw, Image as ImageIcon, Video, VideoOff, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';

export default function QrScanner({ onScan, isScanning }) {
  const [mode, setMode] = useState('camera'); // 'camera' | 'upload'
  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [detectedText, setDetectedText] = useState(null);
  const [showTimeoutHint, setShowTimeoutHint] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);
  const hasScannedRef = useRef(false);
  const previewUrlRef = useRef(null);
  const timeoutHintTimerRef = useRef(null);
  const containerId = 'qr-reader-container';

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutHintTimerRef.current);
      // Free the uploaded-image preview (object URLs are never garbage collected on their own)
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  // Enumerate cameras on camera mode mount
  useEffect(() => {
    let isCurrent = true;
    if (mode === 'camera') {
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (!isCurrent) return;
          if (devices && devices.length > 0) {
            setCameras(devices);
            setSelectedCameraId((prev) => {
              if (prev && devices.some((d) => d.id === prev)) return prev;
              const backCam = devices.find((d) => /back|rear|environment/i.test(d.label));
              return backCam ? backCam.id : devices[0].id;
            });
          }
        })
        .catch((err) => {
          console.warn('Could not enumerate cameras on mount:', err);
        });
    }
    return () => {
      isCurrent = false;
    };
  }, [mode]);

  // Subtle audio chime on QR detection
  const playDetectionChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (_) {}
  };

  // Start Camera handler
  const startCamera = async (targetCameraId = null) => {
    try {
      setCameraError(null);
      setDetectedText(null);
      setShowTimeoutHint(false);
      clearTimeout(timeoutHintTimerRef.current);
      hasScannedRef.current = false;

      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
        } catch (_) {}
      }

      const container = document.getElementById(containerId);
      if (!container) return;

      // 1. Construct scanner with explicit options
      const html5QrCode = new Html5Qrcode(containerId, {
        useBarCodeDetectorIfSupported: true,
        verbose: false
      });
      scannerRef.current = html5QrCode;

      // 2. Start config
      const config = {
        fps: 15,
        qrbox: (w, h) => {
          const s = Math.floor(Math.min(w, h) * 0.75);
          return { width: s, height: s };
        },
        videoConstraints: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        disableFlip: false
      };

      const handleSuccess = (decodedText) => {
        if (!decodedText || hasScannedRef.current) return;
        hasScannedRef.current = true;
        clearTimeout(timeoutHintTimerRef.current);
        setShowTimeoutHint(false);
        setDetectedText(decodedText);
        playDetectionChime();
        if (navigator.vibrate) navigator.vibrate(100);

        setTimeout(() => {
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
        }, 350);
      };

      // 4. Start with chosen deviceId string if available
      const chosenCamId = targetCameraId || selectedCameraId;
      let cameraStartedSuccessfully = false;

      if (chosenCamId) {
        try {
          await html5QrCode.start(chosenCamId, config, handleSuccess, () => {});
          cameraStartedSuccessfully = true;
        } catch (idErr) {
          console.warn('Camera start with deviceId failed, attempting fallback constraints:', idErr);
        }
      }

      if (!cameraStartedSuccessfully) {
        try {
          await html5QrCode.start({ facingMode: { ideal: 'environment' } }, config, handleSuccess, () => {});
          cameraStartedSuccessfully = true;
        } catch (envErr) {
          console.warn('facingMode environment failed, trying empty constraints:', envErr);
          await html5QrCode.start({}, config, handleSuccess, () => {});
          cameraStartedSuccessfully = true;
        }
      }

      if (!mountedRef.current) {
        html5QrCode.stop().catch(() => {});
        return;
      }

      setIsCameraActive(true);

      // 7. 15-second timeout hint if no QR is decoded
      clearTimeout(timeoutHintTimerRef.current);
      timeoutHintTimerRef.current = setTimeout(() => {
        if (mountedRef.current && !hasScannedRef.current) {
          setShowTimeoutHint(true);
        }
      }, 15000);
    } catch (err) {
      if (!mountedRef.current) return;
      console.warn('Camera initialization error:', err);
      setCameraError('Camera access unavailable or permission denied. Please allow camera permissions or upload an image.');
      setIsCameraActive(false);
      clearTimeout(timeoutHintTimerRef.current);
    }
  };

  // Switch to another camera device
  const handleSwitchCamera = async (newCameraId) => {
    setSelectedCameraId(newCameraId);
    if (cameraStarted && isCameraActive) {
      await stopCamera();
      setTimeout(() => {
        startCamera(newCameraId);
      }, 100);
    }
  };

  // Stop Camera handler
  const stopCamera = async () => {
    clearTimeout(timeoutHintTimerRef.current);
    setShowTimeoutHint(false);
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping camera:', err);
      } finally {
        setIsCameraActive(false);
      }
    }
  };

  // Manage camera state and cleanup without auto-starting on mount
  useEffect(() => {
    if (mode !== 'camera') {
      stopCamera();
      setCameraStarted(false);
    }
    return () => {
      clearTimeout(timeoutHintTimerRef.current);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch (_) {}
        scannerRef.current = null;
      }
    };
  }, [mode]);

  // Start camera only after user explicitly clicked "Start camera"
  useEffect(() => {
    if (cameraStarted && mode === 'camera') {
      const timer = setTimeout(() => {
        startCamera();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [cameraStarted, mode]);

  // Handle image file upload with preview
  const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

  const processFile = async (file) => {
    if (!file) return;

    setFileError(null);
    if (!file.type.startsWith('image/')) {
      setFileError('Please choose an image file (PNG, JPG, WEBP) that contains a QR code.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFileError('This image is larger than 10 MB. Please choose a smaller image or screenshot.');
      return;
    }

    // Create preview URL (revoking the previous one so it doesn't leak)
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setPreviewImage(previewUrl);

    const html5QrCode = new Html5Qrcode('qr-file-dummy');
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      onScan(decodedText);
    } catch (err) {
      console.warn('QR file scan error:', err);
      setFileError('Could not decode a clear QR code from this image. Please ensure the QR code is clearly visible and well-lit.');
    } finally {
      try { html5QrCode.clear(); } catch (_) {}
    }
  };

  const handleFileUpload = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = ''; // allow re-selecting the same file after "Choose Different Image"
  };

  // The upload area advertises "Select or Drop", so dropping a file must actually work
  const handleDrop = (e) => {
    e.preventDefault();
    processFile(e.dataTransfer?.files?.[0]);
  };

  const handleClearPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
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
          aria-pressed={mode === 'camera'}
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
          aria-pressed={mode === 'upload'}
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
          {/* Camera Picker above the viewfinder if more than one camera */}
          {cameras.length > 1 && (
            <div className="flex items-center justify-center sm:justify-end max-w-sm mx-auto">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-xs shadow-subtle">
                <Camera className="w-3.5 h-3.5 text-brand-teal flex-shrink-0" />
                <select
                  aria-label="Choose camera"
                  value={selectedCameraId}
                  onChange={(e) => handleSwitchCamera(e.target.value)}
                  className="bg-transparent text-xs font-medium text-content-primary dark:text-dark-primary focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {cameras.map((c, i) => (
                    <option key={c.id} value={c.id} className="dark:bg-dark-surface text-content-primary">
                      {c.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {!cameraStarted ? (
            /* Do NOT auto-start: show Start camera button first */
            <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border flex flex-col items-center justify-center p-6 text-center space-y-3 shadow-card">
              <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
                <Camera className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-content-primary dark:text-dark-primary">
                  Camera QR Scanner
                </h4>
                <p className="text-xs text-content-secondary dark:text-dark-secondaryText max-w-xs leading-relaxed">
                  Click below to activate your device camera and scan physical QR codes in real time.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={Camera}
                  onClick={() => setCameraStarted(true)}
                >
                  Start camera
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Square viewfinder frame via CSS */}
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

                {/* Instant Visual Detection Confirmation */}
                {detectedText && (
                  <div className="absolute inset-0 bg-status-success/25 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-20 transition-all duration-150">
                    <div className="w-12 h-12 rounded-full bg-status-success text-white flex items-center justify-center shadow-lg mb-2">
                      <CheckCircle2 className="w-6 h-6 animate-pulse" />
                    </div>
                    <span className="text-xs font-bold text-white bg-slate-900/90 px-3.5 py-1.5 rounded-full font-mono shadow-md">
                      QR Code Detected!
                    </span>
                    <span className="text-[10px] text-white/90 max-w-[200px] truncate mt-1.5 font-mono">
                      {detectedText}
                    </span>
                  </div>
                )}

                {/* Camera Permission / Error Fallback */}
                {cameraError && (
                  <div className="absolute inset-0 bg-white/95 dark:bg-dark-surface/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-30">
                    <AlertCircle className="w-8 h-8 text-status-warning" />
                    <h4 className="text-xs font-bold text-content-primary dark:text-dark-primary">Camera Permission Required</h4>
                    <p className="text-xs text-content-secondary dark:text-dark-secondaryText max-w-xs">{cameraError}</p>
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => startCamera()}
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

              {/* 6. Hint line under the viewfinder */}
              <p className="text-xs text-center text-content-secondary dark:text-dark-secondaryText max-w-sm mx-auto leading-relaxed">
                Hold the code 20-30 cm away, keep it steady, avoid glare. Or use Upload image.
              </p>

              {/* 7. 15-second no-code inline hint */}
              {showTimeoutHint && isCameraActive && !detectedText && (
                <div className="p-3 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border flex items-center justify-between gap-3 text-xs text-content-secondary dark:text-dark-secondaryText max-w-sm mx-auto animate-fadeIn">
                  <span>Having trouble scanning?</span>
                  <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className="px-3 py-1.5 rounded-lg bg-brand-teal text-white font-semibold text-xs hover:bg-brand-teal-hover transition-colors shadow-subtle flex-shrink-0"
                  >
                    Use Upload image
                  </button>
                </div>
              )}

              {/* Camera Controls */}
              <div className="flex items-center justify-center gap-2 pt-1">
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
                    onClick={() => startCamera()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-brand-teal text-xs font-semibold"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Resume Camera</span>
                  </button>
                )}
              </div>
            </>
          )}
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
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-border hover:border-brand-teal rounded-2xl cursor-pointer bg-white dark:bg-dark-surface hover:bg-canvas-subtle/50 transition-colors p-6 text-center group shadow-card">
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
                aria-label="Upload an image containing a QR code"
                className="sr-only"
                onChange={handleFileUpload}
              />
            </label>
          )}

          {fileError && (
            <div role="alert" className="p-3 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-center space-x-2">
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

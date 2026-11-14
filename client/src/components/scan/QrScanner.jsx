import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, AlertCircle, RefreshCw, Image as ImageIcon, Video, VideoOff, CheckCircle2, SwitchCamera } from 'lucide-react';
import Button from '../common/Button';

export default function QrScanner({ onScan, isScanning }) {
  const [mode, setMode] = useState('camera'); // 'camera' | 'upload'
  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [detectedText, setDetectedText] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);
  const hasScannedRef = useRef(false);
  const previewUrlRef = useRef(null);
  const containerId = 'qr-reader-container';

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Free the uploaded-image preview (object URLs are never garbage collected on their own)
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

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

  // Start Camera handler with laptop webcam & mobile fallbacks
  const startCamera = async (targetCameraId = null) => {
    try {
      setCameraError(null);
      setDetectedText(null);
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

      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      // Query available video devices
      let deviceList = [];
      try {
        deviceList = await Html5Qrcode.getCameras();
        if (deviceList && deviceList.length > 0) {
          setCameras(deviceList);
        }
      } catch (camErr) {
        console.warn('Could not list cameras:', camErr);
      }

      const config = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edge = Math.floor(minEdge * 0.88);
          return { width: edge, height: edge };
        },
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      const handleSuccess = (decodedText) => {
        if (!decodedText || hasScannedRef.current) return;
        hasScannedRef.current = true;
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

      // Determine camera identifier:
      // 1. Explicitly passed targetCameraId or selectedCameraId
      // 2. Or prefer rear camera if mobile, or first camera (integrated webcam) on laptop
      let chosenCamId = targetCameraId || selectedCameraId;
      if (!chosenCamId && deviceList.length > 0) {
        const backCam = deviceList.find(d => /back|rear|environment/i.test(d.label));
        chosenCamId = backCam ? backCam.id : deviceList[0].id;
        setSelectedCameraId(chosenCamId);
      }

      let cameraStartedSuccessfully = false;

      // Attempt 1: Start with specific camera device ID
      if (chosenCamId) {
        try {
          await html5QrCode.start(chosenCamId, config, handleSuccess, () => {});
          cameraStartedSuccessfully = true;
        } catch (idErr) {
          console.warn('Camera start with device ID failed, trying constraints fallback:', idErr);
        }
      }

      // Attempt 2: Fallback for laptops/desktops (facingMode: 'user' for front webcam)
      if (!cameraStartedSuccessfully) {
        try {
          await html5QrCode.start({ facingMode: 'user' }, config, handleSuccess, () => {});
          cameraStartedSuccessfully = true;
        } catch (userErr) {
          console.warn('facingMode user failed, trying environment:', userErr);
          // Attempt 3: Fallback for mobile (facingMode: 'environment')
          try {
            await html5QrCode.start({ facingMode: 'environment' }, config, handleSuccess, () => {});
            cameraStartedSuccessfully = true;
          } catch (envErr) {
            console.warn('facingMode environment failed, trying empty config:', envErr);
            // Attempt 4: Any available video stream
            await html5QrCode.start({}, config, handleSuccess, () => {});
            cameraStartedSuccessfully = true;
          }
        }
      }

      if (!mountedRef.current) {
        html5QrCode.stop().catch(() => {});
        return;
      }
      setIsCameraActive(true);
    } catch (err) {
      if (!mountedRef.current) return;
      console.warn('Camera initialization error:', err);
      setCameraError('Camera access unavailable or permission denied. Please allow camera permissions or upload an image.');
      setIsCameraActive(false);
    }
  };

  // Switch to another camera device
  const handleSwitchCamera = async (newCameraId) => {
    setSelectedCameraId(newCameraId);
    if (cameraStarted) {
      await stopCamera();
      setTimeout(() => {
        startCamera(newCameraId);
      }, 100);
    }
  };

  // Stop Camera handler
  const stopCamera = async () => {
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
          {!cameraStarted ? (
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

              {/* Camera Controls & Camera Switcher */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
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

                {/* Multi-camera selector (Webcam vs Back Cam) */}
                {cameras.length > 1 && (
                  <div className="flex items-center space-x-1 bg-white dark:bg-dark-surface border border-border dark:border-dark-border px-2 py-1 rounded-lg">
                    <SwitchCamera className="w-3.5 h-3.5 text-content-muted" />
                    <select
                      value={selectedCameraId}
                      onChange={(e) => handleSwitchCamera(e.target.value)}
                      className="bg-transparent text-xs text-content-secondary dark:text-dark-secondaryText focus:outline-none cursor-pointer max-w-[150px] truncate"
                    >
                      {cameras.map((c, i) => (
                        <option key={c.id} value={c.id} className="dark:bg-dark-surface text-content-primary">
                          {c.label || `Camera ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
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

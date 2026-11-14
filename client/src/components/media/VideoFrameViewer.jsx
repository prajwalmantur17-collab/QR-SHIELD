import React, { useRef, useState, useEffect } from 'react';
import { Video, Film, Eye, Play, Pause, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDuration } from '../../services/media/mediaUtils';
import Badge from '../common/Badge';

export default function VideoFrameViewer({ file, frameReel = [], frameMetrics = [], duration = 0, videoWidth = 0, videoHeight = 0 }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  // Draw Frame Similarity & Luminance Trend
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frameMetrics || frameMetrics.length === 0) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Grid line at 80% similarity
    ctx.strokeStyle = '#EDF1EF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.2);
    ctx.lineTo(width, height * 0.2);
    ctx.stroke();

    // Draw similarity curve
    ctx.strokeStyle = '#167D73'; // Brand teal
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < frameMetrics.length; i++) {
      const pt = frameMetrics[i];
      const x = (i / (frameMetrics.length - 1)) * width;
      // Similarity 0-100 mapped to canvas height
      const y = height - (pt.similarity / 100) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Highlight abrupt drops / identical frame points
    for (let i = 0; i < frameReel.length; i++) {
      const frame = frameReel[i];
      const x = (i / (frameReel.length - 1)) * width;

      if (frame.isDuplicated) {
        // Red dot for frozen/duplicated frame
        ctx.fillStyle = '#D45B61';
        ctx.beginPath();
        ctx.arc(x, 10, 4, 0, 2 * Math.PI);
        ctx.fill();
      } else if (frame.isAbrupt) {
        // Orange marker for sudden cut
        ctx.fillStyle = '#E06A26';
        ctx.beginPath();
        ctx.arc(x, height - 10, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }, [frameMetrics, frameReel]);

  return (
    <div className="space-y-4">
      
      {/* Video Player & Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left: Video Player */}
        <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center border border-border dark:border-dark-border shadow-subtle max-h-64 sm:max-h-72">
          {videoUrl && (
            <video
              src={videoUrl}
              controls
              playsInline
              className="w-full h-full max-h-64 sm:max-h-72 object-contain"
            />
          )}
        </div>

        {/* Right: Similarity & Temporal Consistency Graph */}
        <div className="p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-border dark:border-dark-border">
              <div className="flex items-center space-x-1.5 font-bold text-content-primary dark:text-dark-primary font-mono text-[11px] uppercase tracking-wider">
                <Film className="w-3.5 h-3.5 text-brand-teal" />
                <span>Temporal Frame Similarity Graph</span>
              </div>
              <Badge variant="teal" size="xs">
                {frameReel.length} Sampled Frames
              </Badge>
            </div>

            <div className="pt-2">
              <canvas
                ref={canvasRef}
                width={400}
                height={100}
                className="w-full h-24 block select-none bg-white dark:bg-dark-surface rounded-lg border border-border dark:border-dark-border shadow-subtle p-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-content-secondary dark:text-dark-secondaryText pt-2 border-t border-border dark:border-dark-border">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#D45B61]" />
              <span>Red: Frozen / Duplicated Frame</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#E06A26]" />
              <span>Orange: Splicing Cut</span>
            </span>
          </div>
        </div>

      </div>

      {/* Sampled Frame Carousel / Thumbnail Reel */}
      <div className="p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-content-primary dark:text-dark-primary font-mono text-[11px] uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5 text-brand-blue" />
            <span>Sampled Frame Reel (Temporal Sequence)</span>
          </div>
          <span className="text-[11px] text-content-muted font-mono">
            Click frame to inspect details
          </span>
        </div>

        {/* Scrollable Reel */}
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {frameReel.map((frame) => {
            const isSelected = selectedFrame?.index === frame.index;
            return (
              <div
                key={frame.index}
                onClick={() => setSelectedFrame(frame)}
                className={`flex-shrink-0 cursor-pointer rounded-lg border overflow-hidden transition-all group ${
                  isSelected
                    ? 'ring-2 ring-brand-teal border-brand-teal shadow-card'
                    : 'border-border dark:border-dark-border hover:border-brand-teal/50'
                }`}
              >
                <div className="relative w-24 h-16 bg-black">
                  <img
                    src={frame.thumbnail}
                    alt={`Frame at ${frame.time}s`}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    loading="lazy"
                  />
                  {frame.isDuplicated && (
                    <span className="absolute top-1 right-1 px-1 py-0.2 rounded bg-status-danger text-white text-[9px] font-bold font-mono">
                      DUP
                    </span>
                  )}
                  {frame.isAbrupt && (
                    <span className="absolute top-1 right-1 px-1 py-0.2 rounded bg-amber-500 text-white text-[9px] font-bold font-mono">
                      CUT
                    </span>
                  )}
                  <span className="absolute bottom-1 left-1 px-1 rounded bg-black/70 text-white text-[9px] font-mono">
                    {frame.time}s
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Frame Detail Callout */}
        {selectedFrame && (
          <div className="p-3 rounded-lg bg-white dark:bg-dark-surface border border-border dark:border-dark-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-content-primary font-mono">
                Frame #{selectedFrame.index} ({selectedFrame.time}s)
              </span>
              <span className="text-content-secondary font-mono">
                Luma: {selectedFrame.brightness} • Contrast: {selectedFrame.contrast}
              </span>
              <span className="text-content-secondary font-mono">
                Similarity: {selectedFrame.similarity}% (MSE: {selectedFrame.mse})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedFrame(null)}
              className="text-[11px] text-brand-teal font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

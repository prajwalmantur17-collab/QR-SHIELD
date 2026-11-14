import React, { useRef, useEffect } from 'react';
import { Activity, Radio, MicOff } from 'lucide-react';
import Card from '../common/Card';

export default function AudioMetricsGraph({ 
  pitchContour = [], 
  duration = 0, 
  meanPitch = 0,
  pitchStdDev = 0,
  silenceRatio = 0,
  avgSpectralCentroid = 0,
  avgSpectralRolloff = 0
}) {
  const pitchCanvasRef = useRef(null);

  // Draw Pitch Contour Graph
  useEffect(() => {
    const canvas = pitchCanvasRef.current;
    if (!canvas || !pitchContour || pitchContour.length === 0) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Min and max pitch range for scaling
    const validPitches = pitchContour.filter(p => p.pitch !== null).map(p => p.pitch);
    const minP = validPitches.length > 0 ? Math.max(50, Math.min(...validPitches) - 20) : 50;
    const maxP = validPitches.length > 0 ? Math.min(500, Math.max(...validPitches) + 20) : 400;

    // Grid lines
    ctx.strokeStyle = '#EDF1EF';
    ctx.lineWidth = 1;
    for (let f = 100; f <= 400; f += 100) {
      const y = height - ((f - minP) / (maxP - minP)) * height;
      if (y >= 0 && y <= height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw pitch trajectory
    ctx.strokeStyle = '#527DA8'; // Brand steel blue
    ctx.lineWidth = 2;
    ctx.beginPath();
    let isDrawing = false;

    for (let i = 0; i < pitchContour.length; i++) {
      const pt = pitchContour[i];
      const x = (i / (pitchContour.length - 1)) * width;

      if (pt.pitch !== null) {
        const y = height - ((pt.pitch - minP) / (maxP - minP)) * height;
        if (!isDrawing) {
          ctx.moveTo(x, y);
          isDrawing = true;
        } else {
          ctx.lineTo(x, y);
        }
      } else {
        isDrawing = false;
      }
    }
    ctx.stroke();

    // Draw mean pitch line
    if (meanPitch > 0) {
      const meanY = height - ((meanPitch - minP) / (maxP - minP)) * height;
      if (meanY >= 0 && meanY <= height) {
        ctx.strokeStyle = '#167D73'; // Brand teal dashed
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, meanY);
        ctx.lineTo(width, meanY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [pitchContour, meanPitch]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      {/* 1. Pitch Contour Graph */}
      <div className="p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-content-primary dark:text-dark-primary font-mono text-[11px] uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-brand-blue" />
            <span>Pitch Contour (F0 Dynamics)</span>
          </div>
          <span className="font-mono text-[11px] text-content-secondary dark:text-dark-secondaryText">
            Mean: <strong className="text-content-primary">{meanPitch} Hz</strong> (σ = {pitchStdDev} Hz)
          </span>
        </div>

        <div className="relative rounded-lg overflow-hidden bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-subtle p-2">
          <canvas
            ref={pitchCanvasRef}
            width={400}
            height={90}
            className="w-full h-20 block select-none"
          />
        </div>

        <p className="text-[11px] text-content-muted dark:text-dark-muted leading-relaxed">
          Natural human speech displays fluid pitch inflection. Monotone pitch contours (σ &lt; 12 Hz) are characteristic of robotic text-to-speech vocoders.
        </p>
      </div>

      {/* 2. Silence & Spectral Distribution */}
      <div className="p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-content-primary dark:text-dark-primary font-mono text-[11px] uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-brand-teal" />
            <span>Spectral & Silence Distribution</span>
          </div>
          <span className="font-mono text-[11px] text-brand-teal font-semibold">
            Centroid: {avgSpectralCentroid} Hz
          </span>
        </div>

        {/* Silence Timeline Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-content-secondary font-medium">Speech vs Pause Ratio:</span>
            <span className="font-mono font-semibold text-content-primary">
              {(100 - silenceRatio).toFixed(1)}% Speech • {silenceRatio}% Pause
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-canvas border border-border dark:border-dark-border overflow-hidden flex">
            <div 
              style={{ width: `${100 - silenceRatio}%` }} 
              className="bg-brand-teal h-full" 
              title="Active Speech Energy"
            />
            <div 
              style={{ width: `${silenceRatio}%` }} 
              className="bg-amber-300 dark:bg-amber-500/50 h-full" 
              title="Pause / Ambient Silence"
            />
          </div>
        </div>

        {/* Spectral Rolloff Metric */}
        <div className="pt-2 border-t border-border dark:border-dark-border flex items-center justify-between text-[11px]">
          <span className="text-content-secondary font-medium">Spectral Rolloff (85% Band):</span>
          <span className="font-mono font-bold text-content-primary">
            {avgSpectralRolloff} Hz
          </span>
        </div>

        <p className="text-[11px] text-content-muted dark:text-dark-muted leading-relaxed">
          Natural speech maintains energy across full bandwidth. Sudden frequency drop-offs below 9 kHz can indicate upsampled or band-limited neural synthesis.
        </p>
      </div>

    </div>
  );
}

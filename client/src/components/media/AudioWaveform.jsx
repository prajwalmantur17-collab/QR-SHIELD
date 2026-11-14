import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';
import { formatDuration } from '../../services/media/mediaUtils';

export default function AudioWaveform({ file, waveformPoints = [], duration = 0 }) {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    if (!canvasRef.current || !audioRef.current || duration <= 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const seekTime = ratio * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Draw waveform to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformPoints || waveformPoints.length === 0) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Background subtle grid lines
    ctx.strokeStyle = '#E2E8E5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    const progressRatio = duration > 0 ? (currentTime / duration) : 0;
    const playheadX = progressRatio * width;

    // Draw waveform bars
    const barWidth = width / waveformPoints.length;
    for (let i = 0; i < waveformPoints.length; i++) {
      const pt = waveformPoints[i];
      const x = i * barWidth;
      const barHeight = Math.max(3, pt.avg * height * 0.9);

      // Color based on playhead position
      if (x <= playheadX) {
        ctx.fillStyle = '#167D73'; // Played: authoritative teal
      } else {
        ctx.fillStyle = '#A0ACB6'; // Unplayed: muted slate
      }

      ctx.fillRect(x, centerY - barHeight / 2, Math.max(1, barWidth - 1), barHeight);
    }

    // Draw playhead cursor
    if (playheadX > 0 && playheadX <= width) {
      ctx.strokeStyle = '#D45B61';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }
  }, [waveformPoints, currentTime, duration]);

  return (
    <div className="p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-brand-teal" />
          <span className="font-bold text-content-primary dark:text-dark-primary font-mono text-[11px] uppercase tracking-wider">
            Audio Signal Waveform (RMS Amplitude)
          </span>
        </div>

        <div className="font-mono text-xs text-content-secondary dark:text-dark-secondaryText">
          <span className="text-content-primary dark:text-dark-primary font-semibold">
            {formatDuration(currentTime)}
          </span>
          <span className="text-content-muted"> / {formatDuration(duration)}</span>
        </div>
      </div>

      {/* Interactive Waveform Canvas */}
      <div className="relative cursor-pointer rounded-lg overflow-hidden bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-subtle">
        <canvas
          ref={canvasRef}
          width={700}
          height={90}
          onClick={handleSeek}
          className="w-full h-20 sm:h-24 block select-none"
        />
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-teal text-white hover:bg-brand-teal-hover transition-colors shadow-subtle"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Audio'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-white dark:hover:bg-dark-surface border border-border dark:border-dark-border transition-colors"
            title="Restart from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-[11px] text-content-muted dark:text-dark-muted font-mono">
          Click waveform to scrub
        </span>
      </div>
    </div>
  );
}

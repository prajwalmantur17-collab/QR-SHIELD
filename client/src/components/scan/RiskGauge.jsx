import React from 'react';
import { motion } from 'framer-motion';

export default function RiskGauge({ score = 0, verdict = 'safe' }) {
  // Semicircle gauge (radius 80, cx 100, cy 100)
  const radius = 75;
  const circumference = Math.PI * radius; // Half-circle
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (verdict === 'dangerous' || score >= 70) return '#EF4444';
    if (verdict === 'suspicious' || score >= 30) return '#F59E0B';
    return '#22C55E';
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative w-48 h-28 flex items-center justify-center overflow-hidden">
        <svg className="w-48 h-48 transform -rotate-180" viewBox="0 0 200 200">
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset="0"
            strokeLinecap="round"
            className="text-dark-elevated dark:text-dark-elevated/80"
          />
          {/* Animated Gauge Fill */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="14"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-extrabold tracking-tight font-mono"
            style={{ color }}
          >
            {score}
          </motion.span>
          <span className="text-[11px] uppercase tracking-wider text-dark-muted font-medium -mt-1">
            Risk Score / 100
          </span>
        </div>
      </div>

      {/* Segment Legend */}
      <div className="flex items-center space-x-3 text-[10px] text-dark-muted mt-2 font-mono">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-verdict-safe"></span>
          <span>0-29 Safe</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-verdict-suspicious"></span>
          <span>30-69 Suspicious</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-verdict-dangerous"></span>
          <span>70-100 Dangerous</span>
        </span>
      </div>
    </div>
  );
}

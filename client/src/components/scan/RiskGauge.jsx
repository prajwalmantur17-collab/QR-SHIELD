import React from 'react';
import { motion } from 'framer-motion';

export default function RiskGauge({ score = 0, verdict = 'safe' }) {
  const radius = 70;
  const circumference = Math.PI * radius; // Half-circle
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getStatusColor = () => {
    if (verdict === 'dangerous' || score >= 70) return '#D45B61'; // Danger
    if (verdict === 'suspicious' || score >= 30) return '#C58A32'; // Warning
    return '#23845D'; // Success
  };

  const statusColor = getStatusColor();

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative w-44 h-24 flex items-center justify-center overflow-hidden">
        <svg className="w-44 h-44 transform -rotate-180" viewBox="0 0 200 200">
          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset="0"
            strokeLinecap="round"
            className="text-border dark:text-dark-border"
          />
          {/* Animated Gauge Fill */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke={statusColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-3xl font-extrabold tracking-tight font-mono"
            style={{ color: statusColor }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] uppercase tracking-wider text-content-muted dark:text-dark-muted font-semibold -mt-0.5">
            Risk Score / 100
          </span>
        </div>
      </div>

      {/* Segment Legend */}
      <div className="flex items-center space-x-3 text-[10px] text-content-muted dark:text-dark-muted mt-2 font-medium">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-status-success"></span>
          <span>0–29 Safe</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-status-warning"></span>
          <span>30–69 Suspicious</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-status-danger"></span>
          <span>70–100 Dangerous</span>
        </span>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Network, BrainCircuit, Check, Loader2 } from 'lucide-react';

export default function ScanProgress({ inputType = 'link' }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Rule Engine Analysis',
      desc: 'Evaluating 14+ deterministic security heuristics & blacklist',
      icon: ShieldCheck
    },
    {
      title: inputType === 'link' ? 'Safe Link Expansion' : 'Payload & Structural Verification',
      desc: inputType === 'link' ? 'Following redirects with strict SSRF protection' : 'Verifying cryptographic hashes and protocol schemas',
      icon: Network
    },
    {
      title: 'Gemini AI Threat Synthesis',
      desc: 'Deep social engineering & context assessment via Google Gemini',
      icon: BrainCircuit
    }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 700);
    const timer2 = setTimeout(() => setCurrentStep(2), 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="py-8 px-4 flex flex-col items-center max-w-md mx-auto w-full">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-2xl bg-brand-indigo/20 animate-ping"></div>
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-cyan flex items-center justify-center text-white shadow-glow">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-dark-text mb-1 tracking-tight">
        Analyzing Threat Vectors...
      </h3>
      <p className="text-xs text-dark-muted mb-8 text-center">
        Running privacy-preserving zero-knowledge security scans
      </p>

      {/* Stepper */}
      <div className="w-full space-y-4">
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className={`flex items-start space-x-3.5 p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-dark-elevated/80 border-brand-indigo/50 shadow-sm'
                  : isDone
                  ? 'bg-dark-surface/40 border-dark-border/40 opacity-90'
                  : 'bg-transparent border-transparent opacity-40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isCurrent
                    ? 'bg-brand-indigo text-white shadow-glow'
                    : 'bg-dark-elevated text-dark-muted'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 text-emerald-400" /> : <Icon className="w-4 h-4" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-dark-text">{step.title}</p>
                  {isCurrent && (
                    <span className="text-[10px] text-brand-cyan animate-pulse font-mono">
                      Processing...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-dark-muted mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

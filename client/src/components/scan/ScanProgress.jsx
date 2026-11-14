import React, { useEffect, useState } from 'react';
import { ShieldCheck, Network, BrainCircuit, Check, Loader2 } from 'lucide-react';

export default function ScanProgress({ inputType = 'link' }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Rule Engine Evaluation',
      desc: 'Checking 14+ deterministic security heuristics, typosquatting & domain integrity',
      icon: ShieldCheck
    },
    {
      title: inputType === 'link' ? 'Safe Link Expansion' : 'Protocol & Structural Verification',
      desc: inputType === 'link' ? 'Following redirect chains with loopback & private IP SSRF prevention' : 'Verifying format schemas, cryptographic hashes, and payload patterns',
      icon: Network
    },
    {
      title: 'Google Gemini Threat Synthesis',
      desc: 'Evaluating social engineering vectors, pretexting traps, and contextual intent',
      icon: BrainCircuit
    }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 600);
    const timer2 = setTimeout(() => setCurrentStep(2), 1300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="py-8 px-4 flex flex-col items-center max-w-md mx-auto w-full">
      <div className="w-12 h-12 rounded-xl bg-brand-teal-subtle text-brand-teal flex items-center justify-center mb-5 shadow-subtle">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>

      <h3 className="text-base font-bold text-content-primary dark:text-dark-primary mb-1 tracking-tight">
        Analyzing Security Vectors
      </h3>
      <p className="text-xs text-content-secondary dark:text-dark-secondaryText mb-6 text-center">
        Running privacy-preserving zero-knowledge threat evaluation
      </p>

      {/* Stepper */}
      <div className="w-full space-y-3">
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className={`flex items-start space-x-3 p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-canvas-pure dark:bg-dark-surface border-brand-teal/40 shadow-subtle'
                  : isDone
                  ? 'bg-canvas-subtle/70 dark:bg-dark-secondary/50 border-border dark:border-dark-border opacity-90'
                  : 'bg-transparent border-transparent opacity-40'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-colors mt-0.5 ${
                  isDone
                    ? 'bg-status-success-bg text-status-success border border-status-success-border'
                    : isCurrent
                    ? 'bg-brand-teal text-white shadow-subtle'
                    : 'bg-canvas-subtle dark:bg-dark-secondary text-content-muted'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-content-primary dark:text-dark-primary">{step.title}</p>
                  {isCurrent && (
                    <span className="text-[10px] text-brand-teal font-medium">
                      In progress...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-content-secondary dark:text-dark-secondaryText mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

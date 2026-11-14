import React from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, DollarSign, MessageSquare, Globe } from 'lucide-react';

export const SAMPLES = [
  {
    id: 'kyc-sms',
    title: 'Fake KYC Bank SMS',
    type: 'message',
    icon: MessageSquare,
    badge: 'Dangerous',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    content: 'Dear SBI Customer, your YONO account will be blocked within 24 hours. Please click http://sbi-kyc-update.xyz to update your PAN and Aadhaar immediately or call customer care.',
    desc: 'Simulates urgent bank SMS phishing asking for KYC update on an unverified domain.'
  },
  {
    id: 'lookalike-url',
    title: 'Lookalike Typosquat URL',
    type: 'link',
    icon: Globe,
    badge: 'Dangerous',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    content: 'http://paytmm-secure-cashback.top/login?verify=kyc',
    desc: 'Typosquatting brand domain targeting Paytm on a suspicious .top TLD over HTTP.'
  },
  {
    id: 'upi-collect',
    title: 'Deceptive UPI Collect QR',
    type: 'qr',
    icon: DollarSign,
    badge: 'Dangerous',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    content: 'upi://collect?pa=refund-desk-online99@paytm&pn=Electricity_Bill_Refund&am=4999&cu=INR&tn=Cashback_Refund_Approved',
    desc: 'Disguised collect request claiming to be a refund, draining ₹4,999 upon PIN entry.'
  },
  {
    id: 'safe-url',
    title: 'Legitimate Safe Website',
    type: 'link',
    icon: ShieldCheck,
    badge: 'Safe',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    content: 'https://github.com',
    desc: 'Verified legitimate HTTPS platform with clean domain reputation.'
  }
];

export default function SampleCards({ onSelectSample }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-xs font-semibold text-dark-muted uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
        <span>One-Click Threat Demonstrations (Hackathon Testing)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SAMPLES.map((sample) => {
          const Icon = sample.icon;
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className="text-left p-3.5 rounded-xl bg-dark-elevated/50 hover:bg-dark-elevated border border-dark-border/60 hover:border-brand-indigo/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-dark-surface border border-dark-border text-brand-cyan group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${sample.badgeColor}`}>
                    {sample.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-dark-text group-hover:text-brand-cyan transition-colors line-clamp-1">
                  {sample.title}
                </h4>
                <p className="text-[11px] text-dark-muted mt-1 line-clamp-2 leading-relaxed">
                  {sample.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-dark-border/40 flex items-center justify-between text-[11px] font-medium text-brand-indigo group-hover:text-brand-cyan transition-colors">
                <span>Run Demo Test</span>
                <span className="font-mono text-xs">→</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

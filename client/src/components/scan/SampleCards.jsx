import React from 'react';
import { Sparkles, ShieldCheck, DollarSign, MessageSquare, Globe, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

export const SAMPLES = [
  {
    id: 'lookalike-url',
    title: 'Lookalike Typosquat URL',
    type: 'link',
    icon: Globe,
    badge: 'Dangerous',
    badgeVariant: 'dangerous',
    content: 'http://paytmm-secure-cashback.top/login?verify=kyc',
    desc: 'Typosquatting brand domain targeting Paytm on an unverified .top TLD over HTTP.'
  },
  {
    id: 'upi-collect',
    title: 'Deceptive UPI Collect QR',
    type: 'qr',
    icon: DollarSign,
    badge: 'Dangerous',
    badgeVariant: 'dangerous',
    content: 'upi://collect?pa=refund-desk-online99@paytm&pn=Electricity_Bill_Refund&am=4999&cu=INR&tn=Cashback_Refund_Approved',
    desc: 'Disguised collect request claiming to be a refund, draining funds upon MPIN entry.'
  },
  {
    id: 'kyc-sms',
    title: 'Urgent Bank KYC SMS',
    type: 'message',
    icon: MessageSquare,
    badge: 'Dangerous',
    badgeVariant: 'dangerous',
    content: 'Dear SBI Customer, your YONO account will be blocked within 24 hours. Please click http://sbi-kyc-update.xyz to update your PAN and Aadhaar immediately.',
    desc: 'Simulates urgent bank SMS phishing asking for KYC update on an unverified domain.'
  },
  {
    id: 'safe-url',
    title: 'Verified Safe Website',
    type: 'link',
    icon: ShieldCheck,
    badge: 'Safe',
    badgeVariant: 'safe',
    content: 'https://github.com',
    desc: 'Verified legitimate HTTPS platform with clean domain age and SSL certificates.'
  }
];

export default function SampleCards({ onSelectSample }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
        <div className="flex items-center space-x-2 font-semibold text-content-muted dark:text-dark-muted uppercase font-mono tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
          <span>One-Click Threat Simulation Benchmarks</span>
        </div>
        {!isAuthenticated && (
          <span className="text-[11px] text-content-muted dark:text-dark-muted font-normal italic">
            Runs a real scan (counts toward your daily limit)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SAMPLES.map((sample) => {
          const Icon = sample.icon;
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className="text-left p-3.5 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border hover:border-brand-teal/50 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group focus:outline-none"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary text-brand-teal group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge variant={sample.badgeVariant} size="xs">
                    {sample.badge}
                  </Badge>
                </div>
                <h4 className="text-xs font-bold text-content-primary dark:text-dark-primary group-hover:text-brand-teal transition-colors line-clamp-1">
                  {sample.title}
                </h4>
                <p className="text-[11px] text-content-secondary dark:text-dark-secondaryText mt-1 line-clamp-2 leading-relaxed">
                  {sample.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-border dark:border-dark-border flex items-center justify-between text-[11px] font-semibold text-brand-teal group-hover:translate-x-0.5 transition-transform">
                <span>Load Benchmark</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

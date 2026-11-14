import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, EyeOff, Cpu, Heart, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-dark-border/60 bg-dark-surface/40 pt-12 pb-24 md:pb-12 text-sm text-dark-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-cyan flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-base text-dark-text tracking-tight">
                QR <span className="text-brand-cyan">SHIELD</span>
              </span>
            </div>
            <p className="text-xs text-dark-muted leading-relaxed max-w-md">
              AI Security, Privacy & Trust platform. Real-time zero-knowledge detection for malicious QR codes, phishing links, UPI scams, and fraudulent messages without ever storing raw user text.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-dark-elevated text-brand-cyan border border-brand-indigo/30">
                <Lock className="w-3 h-3" />
                <span>SHA-256 Salted Hashes</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-dark-elevated text-emerald-400 border border-emerald-500/30">
                <EyeOff className="w-3 h-3" />
                <span>Zero Content Retention</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-dark-elevated text-indigo-300 border border-indigo-500/30">
                <Cpu className="w-3 h-3" />
                <span>Google Gemini Engine</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-text mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/scan" className="hover:text-dark-text transition-colors">Unified Scanner</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-dark-text transition-colors">Threat Dashboard</Link>
              </li>
              <li>
                <Link to="/awareness" className="hover:text-dark-text transition-colors">Scam Awareness Guide</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-dark-text transition-colors">Privacy Center</Link>
              </li>
            </ul>
          </div>

          {/* Hackathon & Security Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-text mb-3">Defense Specs</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSRF Loopback Protection</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>UPI Collect Fraud Parser</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>PWA Web Share Target</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Explainable AI Signals</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-dark-border/40 flex flex-col sm:flex-row items-center justify-between text-xs text-dark-muted">
          <p>© 2026 QR Shield. Built for the AI Security, Privacy & Trust Hackathon.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Scan before you trust.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

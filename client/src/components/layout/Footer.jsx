import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, EyeOff, Cpu, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border dark:border-dark-border bg-white dark:bg-dark-surface pt-12 pb-12 text-sm text-content-secondary dark:text-dark-secondaryText transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center shadow-subtle">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-content-primary dark:text-dark-primary tracking-tight">
                QR <span className="text-brand-teal">SHIELD</span>
              </span>
            </div>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed max-w-md">
              AI Security, Privacy & Trust platform. Real-time zero-knowledge verification for QR codes, payment links, and suspicious text messages without storing raw user content.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-canvas-subtle dark:bg-dark-secondary text-brand-teal dark:text-brand-teal border border-border dark:border-dark-border">
                <Lock className="w-3 h-3" />
                <span>Salted HMAC-SHA-256</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-canvas-subtle dark:bg-dark-secondary text-status-success dark:text-status-success border border-border dark:border-dark-border">
                <EyeOff className="w-3 h-3" />
                <span>Zero Raw Content Storage</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-canvas-subtle dark:bg-dark-secondary text-brand-blue dark:text-brand-blue border border-border dark:border-dark-border">
                <Cpu className="w-3 h-3" />
                <span>Google Gemini AI</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-content-primary dark:text-dark-primary mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/scan" className="hover:text-content-primary dark:hover:text-dark-primary transition-colors">Unified Threat Scanner</Link>
              </li>
              <li>
                <Link to="/media" className="hover:text-content-primary dark:hover:text-dark-primary transition-colors">Media Authenticity</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-content-primary dark:hover:text-dark-primary transition-colors">Security Dashboard</Link>
              </li>
              <li>
                <Link to="/awareness" className="hover:text-content-primary dark:hover:text-dark-primary transition-colors">Scam Awareness Guide</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-content-primary dark:hover:text-dark-primary transition-colors">Privacy Center</Link>
              </li>
            </ul>
          </div>

          {/* Security & Architecture Specs */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-content-primary dark:text-dark-primary mb-3">Protection Standards</h4>
            <ul className="space-y-2 text-xs text-content-secondary dark:text-dark-secondaryText">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                <span>SSRF Loopback Defense (Max 5 hops)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                <span>UPI Disguised Collect Parser</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                <span>In-Memory Sensitive Masking</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                <span>PWA Web Share Target API</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-border dark:border-dark-border flex flex-col sm:flex-row items-center justify-between text-xs text-content-muted dark:text-dark-muted">
          <p>© 2026 QR Shield. Built for the AI Security, Privacy & Trust Challenge.</p>
          <p className="mt-2 sm:mt-0 font-medium text-brand-teal">
            Trust • Simplicity • Security • Clarity
          </p>
        </div>
      </div>
    </footer>
  );
}

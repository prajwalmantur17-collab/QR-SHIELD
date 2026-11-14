import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  QrCode, 
  Link2, 
  MessageSquare, 
  Lock, 
  ArrowRight, 
  Cpu, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle,
  DollarSign,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Zap,
  Globe
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';

export default function LandingPage() {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. Hero Section (Stripe/Linear Polish) */}
      <section className="relative pt-12 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-teal-subtle text-brand-teal border border-brand-teal/20">
                <Shield className="w-3.5 h-3.5" />
                <span className="font-mono tracking-tight">AI-Powered Security, Privacy & Trust Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-content-primary dark:text-dark-primary tracking-tight leading-[1.12]">
                Zero-Knowledge Defense for <span className="text-brand-teal">Every Link, QR & Message.</span>
              </h1>

              <p className="text-base sm:text-lg text-content-secondary dark:text-dark-secondaryText max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Inspect untrusted websites in isolated cloud environments, detect disguised UPI requests, and unravel multi-hop phishing before you click.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link to="/scan" className="w-full sm:w-auto">
                  <Button size="lg" variant="primary" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto">
                    Launch Threat Scanner
                  </Button>
                </Link>

                <Link to="/awareness" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Explore Threat Guides
                  </Button>
                </Link>
              </div>

              {/* Trust Attributes */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-content-secondary dark:text-dark-secondaryText">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                  <span>Zero Content Stored</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                  <span>Salted HMAC-SHA-256</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                  <span>Safe Link Preview</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Interactive Security Inspector Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="w-full max-w-md rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-elevated p-6 space-y-5">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border dark:border-dark-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-teal text-white flex items-center justify-center shadow-subtle">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-content-primary dark:text-dark-primary">
                        Example verdict
                      </h4>
                      <span className="text-[10px] text-content-muted font-mono">SHA-256 HMAC Verified</span>
                    </div>
                  </div>
                </div>

                {/* Threat Inspector Simulator Item */}
                <div className="p-4 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-content-primary dark:text-dark-primary font-semibold truncate max-w-[200px]">
                      paytmm-secure-login.top
                    </span>
                    <Badge variant="dangerous">DANGEROUS (92/100)</Badge>
                  </div>

                  <div className="space-y-1.5 text-[11px] pt-1">
                    <div className="flex items-center justify-between text-content-secondary dark:text-dark-secondaryText">
                      <span className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-danger" />
                        <span>Brand Impersonation</span>
                      </span>
                      <span className="text-status-danger font-semibold font-mono">Paytm Brand Lookalike</span>
                    </div>
                    <div className="flex items-center justify-between text-content-secondary dark:text-dark-secondaryText">
                      <span className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-danger" />
                        <span>High-Risk TLD</span>
                      </span>
                      <span className="text-status-danger font-semibold font-mono">.top (Abuse Score: High)</span>
                    </div>
                    <div className="flex items-center justify-between text-content-secondary dark:text-dark-secondaryText">
                      <span className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-warning" />
                        <span>SSRF & Redirect Hops</span>
                      </span>
                      <span className="text-status-warning font-semibold font-mono">2 Hops Resolved</span>
                    </div>
                  </div>
                </div>

                {/* Plain-Language Guidance callout */}
                <div className="p-3.5 rounded-xl bg-brand-teal-subtle text-brand-teal-text border border-brand-teal/20 space-y-1">
                  <span className="font-bold text-[11px] uppercase tracking-wider block font-mono">
                    Explainable AI Guidance
                  </span>
                  <p className="text-xs leading-relaxed">
                    "This website imitates a trusted financial service to harvest banking credentials. Never approve payments or enter SMS OTPs."
                  </p>
                </div>

                {/* Footer Metrics */}
                <div className="pt-2 text-center text-[11px] text-content-muted dark:text-dark-muted font-mono border-t border-border dark:border-dark-border">
                  Sample result - not a live scan
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. Security Capabilities (Linear 4-Pillar Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-teal font-mono">
            Core Threat Engines
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-content-primary dark:text-dark-primary tracking-tight">
            Security Capabilities Built for Daily Digital Life
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary dark:text-dark-secondaryText">
            Full-spectrum deterministic inspection paired with Google Gemini AI heuristics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card hoverEffect padding="md" className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-brand-teal-subtle text-brand-teal flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary tracking-tight">Physical Quishing Defense</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              Detects counterfeit sticker overlays on parking meters, transit kiosks, and dining venues before they trigger fraudulent web flows.
            </p>
          </Card>

          <Card hoverEffect padding="md" className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-brand-blue-subtle text-brand-blue flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary tracking-tight">UPI Disguised Collect Shield</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              Unmasks debit requests falsely disguised as "Cashback" or "Receive Prize". Re-enforces the rule: you never enter a PIN to receive funds.
            </p>
          </Card>

          <Card hoverEffect padding="md" className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary tracking-tight">SSRF-Protected Expander</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              Expands shortened links up to 5 hops with strict private IP (RFC 1918), loopback, and cloud metadata blocking.
            </p>
          </Card>

          <Card hoverEffect padding="md" className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-status-danger-bg text-status-danger flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary tracking-tight">Urgency Coercion NLP</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              Analyzes urgent SMS, WhatsApp, and Telegram texts claiming bank freezes or electricity cutoffs, masking sensitive numbers in memory.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. How It Works (Step Architecture) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-teal font-mono">
              Deterministic Verification Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-content-primary dark:text-dark-primary tracking-tight">
              Three-Tier Security Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary dark:text-dark-secondaryText">
              Every scan traverses a deterministic sanitization and validation pipeline in milliseconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
              <span className="w-7 h-7 rounded-lg bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-brand-teal flex items-center justify-center font-bold text-xs font-mono">
                01
              </span>
              <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">Client-Side Ingestion</h3>
              <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
                QR decoding executes in your local browser sandbox. Images never get transmitted to our servers. Only the decoded target payload is analyzed.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
              <span className="w-7 h-7 rounded-lg bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-brand-teal flex items-center justify-center font-bold text-xs font-mono">
                02
              </span>
              <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">SSRF & Threat Heuristics</h3>
              <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
                Inspects DNS resolution, typosquatting vectors, and redirect hops. Google Gemini AI evaluates contextual coercion and social engineering.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
              <span className="w-7 h-7 rounded-lg bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-brand-teal flex items-center justify-center font-bold text-xs font-mono">
                03
              </span>
              <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">Safe Link Preview</h3>
              <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
                Preview a suspicious site as a static screenshot generated by third-party screenshot services, so your device never connects to it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Zero-Knowledge Trust Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="md" className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-brand-teal-subtle text-brand-teal flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">Zero Raw Content Storage</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              We never store your raw URLs, private WhatsApp messages, or phone numbers. Only non-reversible cryptographic hashes touch our telemetry database.
            </p>
          </Card>

          <Card padding="md" className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-brand-blue-subtle text-brand-blue flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">Radical Transparency</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              Every verdict explains exactly why an item was flagged, tagging signals as deterministic <code className="text-brand-teal font-mono font-bold">[RULE]</code> or <code className="text-brand-blue font-mono font-bold">[AI]</code> threat insights.
            </p>
          </Card>

          <Card padding="md" className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-status-success-bg text-status-success flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">GDPR Right-to-Erasure</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              You own your data. Use our 1-click "Delete My Data" feature anytime to permanently purge your account and scan telemetry.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-elevated space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-brand-teal-subtle text-brand-teal flex items-center justify-center mx-auto shadow-subtle">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-content-primary dark:text-dark-primary tracking-tight">
            Verify Before You Click, Scan, or Pay
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary dark:text-dark-secondaryText max-w-md mx-auto leading-relaxed">
            Free to use for anyone. No account or credit card required to perform your first scan.
          </p>
          <div className="pt-2">
            <Link to="/scan">
              <Button size="lg" variant="primary" icon={ArrowRight} iconPosition="right">
                Open Threat Scanner
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

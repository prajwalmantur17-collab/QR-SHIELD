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
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-teal-subtle text-brand-teal border border-brand-teal/20">
                <Shield className="w-3.5 h-3.5" />
                <span>AI-Powered Cybersecurity & Digital Safety</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-content-primary dark:text-dark-primary tracking-tight leading-[1.15]">
                Stay Safe in a World of <span className="text-brand-teal">Digital Threats.</span>
              </h1>

              <p className="text-base sm:text-lg text-content-secondary dark:text-dark-secondaryText max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Scan QR codes, check suspicious links and identify potential scams before they put your information at risk.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  to="/scan"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-semibold text-sm shadow-subtle transition-colors flex items-center justify-center space-x-2 group"
                >
                  <span>Start Scanning</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/awareness"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-dark-surface hover:bg-canvas-subtle dark:hover:bg-dark-secondary border border-border dark:border-dark-border text-content-primary dark:text-dark-primary font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Explore Security Guide</span>
                </Link>
              </div>

              {/* Trust Attributes */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-content-secondary dark:text-dark-secondaryText">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  <span>Zero Content Stored</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  <span>Salted HMAC-SHA-256 Hashes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  <span>Explainable AI Signals</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Clean Enterprise Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card p-6 space-y-5">
                
                {/* Header of Visual */}
                <div className="flex items-center justify-between pb-3 border-b border-border dark:border-dark-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-md bg-brand-teal text-white flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-content-primary dark:text-dark-primary">
                      Threat Inspector
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-status-success-bg text-status-success border border-status-success-border">
                    Engine Active
                  </span>
                </div>

                {/* Simulated URL Verification Card */}
                <div className="p-3.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-content-secondary dark:text-dark-secondaryText truncate max-w-[190px]">
                      paytmm-secure-login.top
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-status-danger-bg text-status-danger border border-status-danger-border">
                      Dangerous
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] pt-1">
                    <div className="flex items-center justify-between text-content-secondary dark:text-dark-secondaryText">
                      <span>Brand Typosquatting</span>
                      <span className="text-status-danger font-semibold">Flagged (Paytm)</span>
                    </div>
                    <div className="flex items-center justify-between text-content-secondary dark:text-dark-secondaryText">
                      <span>High-Risk TLD</span>
                      <span className="text-status-danger font-semibold">.top Domain</span>
                    </div>
                    <div className="flex items-center justify-between text-content-secondary dark:text-dark-secondaryText">
                      <span>Connection Security</span>
                      <span className="text-status-warning font-semibold">No HTTPS</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Explanation Callout */}
                <div className="p-3 rounded-xl bg-brand-teal-subtle border border-brand-teal/20 text-xs text-brand-teal-text space-y-1">
                  <span className="font-bold block text-[11px] uppercase tracking-wider">Plain-Language Guidance</span>
                  <p className="text-[11px] leading-relaxed">
                    "This website is attempting to imitate a trusted payment brand. Do not enter credentials or approve payments."
                  </p>
                </div>

                {/* Bottom Stats */}
                <div className="pt-2 flex items-center justify-between text-xs text-content-muted dark:text-dark-muted font-mono border-t border-border dark:border-dark-border">
                  <span>Detection Speed: 1.2s</span>
                  <span>Privacy: 100% Salted</span>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Section 1: Security Capabilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-teal font-mono">
            Full-Spectrum Protection
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary dark:text-dark-primary tracking-tight">
            Security Capabilities Built for Daily Life
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary dark:text-dark-secondaryText">
            Protecting users across every digital channel without demanding technical expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-teal-subtle text-brand-teal flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">Physical QR Verification</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              Detects tampered stickers on parking meters, restaurant tables, and utility kiosks before they direct you to malicious payloads.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-blue-subtle text-brand-blue flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">UPI Collect Scam Defense</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              Identifies collect requests disguised as cashback or refunds. Reminds you that you never enter a PIN to receive money.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card space-y-3">
            <div className="w-10 h-10 rounded-lg bg-status-warning-bg text-status-warning flex items-center justify-center">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">SSRF-Safe Link Expander</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              Follows shortened URLs (bit.ly, tinyurl) server-side up to 5 hops with strict private IP and loopback blocking.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card space-y-3">
            <div className="w-10 h-10 rounded-lg bg-status-danger-bg text-status-danger flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">Urgency & OTP Scam NLP</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              Analyzes urgent WhatsApp, SMS, and Telegram texts threatening bank freezes, electricity cuts, or demanding one-time passwords.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-teal font-mono">
              Simple 3-Step Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-content-primary dark:text-dark-primary tracking-tight">
              How QR Shield Works
            </h2>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText">
              From an unfamiliar sticker to an urgent text message, verification takes under two seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-brand-teal flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">Scan or Paste</h3>
              <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
                Scan via camera, upload a photo, paste a link, or use the mobile Share Target directly from any messenger.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-brand-teal flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">Dual-Engine Analysis</h3>
              <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
                Rules inspect domain age, brand lookalikes, and redirect hops. Google Gemini AI reasons over social engineering patterns.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border space-y-3">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-dark-surface border border-border dark:border-dark-border text-brand-teal flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">Explainable Verdict</h3>
              <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
                Get an instant Safe, Suspicious, or Dangerous verdict, calibrated 0-100 risk score, and plain-language action guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Privacy & Trust Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card space-y-3">
            <div className="w-9 h-9 rounded-lg bg-brand-teal-subtle text-brand-teal flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">Zero Raw Content Storage</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              We never store your raw URLs, private WhatsApp messages, or phone numbers. Only non-reversible cryptographic hashes touch our database.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card space-y-3">
            <div className="w-9 h-9 rounded-lg bg-brand-blue-subtle text-brand-blue flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">Radical Transparency</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              Every verdict explains exactly why an item was flagged, tagging signals as deterministic [RULE] or [AI] threat insights.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card space-y-3">
            <div className="w-9 h-9 rounded-lg bg-status-success-bg text-status-success flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-content-primary dark:text-dark-primary">GDPR Right-to-Erasure</h3>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              You own your data. Use our 1-click "Delete My Data" feature anytime to permanently purge your account and scan telemetry.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-content-primary dark:text-dark-primary tracking-tight">
          Verify Before You Click, Scan, or Pay
        </h2>
        <p className="text-xs sm:text-sm text-content-secondary dark:text-dark-secondaryText max-w-md mx-auto">
          Free to use for anyone. No account required to perform your first scan.
        </p>
        <div>
          <Link
            to="/scan"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white font-semibold text-sm shadow-subtle transition-colors"
          >
            <span>Start Scanning Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}

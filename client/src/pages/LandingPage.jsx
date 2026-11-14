import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  QrCode, 
  Link2, 
  MessageSquare, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Share2,
  DollarSign
} from 'lucide-react';

export default function LandingPage() {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-24 pb-16 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-brand-indigo/25 via-brand-cyan/20 to-transparent blur-[120px] pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-dark-surface border border-dark-border text-brand-cyan shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                <span>AI Security, Privacy & Trust Platform</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-dark-text tracking-tight leading-[1.1]">
                Scan before <br />
                <span className="bg-gradient-to-r from-brand-indigo via-brand-cyan to-white bg-clip-text text-transparent">
                  you trust.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-dark-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Scan or paste anything suspicious — physical QR codes, UPI payments, disguised links, or urgent WhatsApp & SMS messages. QR Shield exposes threats in seconds with explainable AI, while strictly guaranteeing your private text is never stored.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/scan"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-indigo via-brand-dark to-brand-indigo text-white font-bold text-sm shadow-glow hover:opacity-95 transition-all flex items-center justify-center space-x-2 group"
                >
                  <span>Scan Now Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  type="button"
                  onClick={scrollToHowItWorks}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-dark-surface hover:bg-dark-elevated border border-dark-border text-dark-text font-semibold text-sm transition-colors"
                >
                  See How It Works
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-dark-muted">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>SHA-256 Salted Hashing Only</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-brand-cyan" />
                  <span>Google Gemini Threat Engine</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EyeOff className="w-4 h-4 text-brand-indigo" />
                  <span>Zero Raw Content Storage</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Animated Phone Mockup with Scanning Beam */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="relative w-72 sm:w-80 rounded-[2.5rem] bg-dark-surface p-4 border-2 border-dark-border shadow-2xl shadow-brand-indigo/10">
                {/* Phone Speaker Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-dark-elevated rounded-full"></div>

                {/* Inner Screen */}
                <div className="mt-4 rounded-[2rem] bg-dark-bg p-5 border border-dark-border/60 relative overflow-hidden space-y-4">
                  {/* Mock Navbar */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-dark-border/40">
                    <span className="font-mono text-brand-cyan font-bold flex items-center space-x-1">
                      <Shield className="w-3.5 h-3.5" />
                      <span>QR SHIELD</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      RADAR ACTIVE
                    </span>
                  </div>

                  {/* Camera Viewfinder Mock */}
                  <div className="relative aspect-square rounded-2xl bg-dark-surface border border-brand-indigo/40 flex items-center justify-center overflow-hidden">
                    {/* Corner Reticles */}
                    <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-brand-cyan"></div>
                    <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-brand-cyan"></div>
                    <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-brand-cyan"></div>
                    <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-brand-cyan"></div>

                    {/* QR Matrix SVG Mock */}
                    <div className="p-4 bg-white rounded-xl shadow-lg">
                      <QrCode className="w-24 h-24 text-dark-bg" />
                    </div>

                    {/* Animated Neon Scanning Laser */}
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-cyan to-transparent shadow-glow-cyan animate-scanline"></div>
                  </div>

                  {/* Clean Live Status Callout */}
                  <div className="p-3 rounded-xl bg-dark-surface border border-brand-indigo/30 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cyan flex items-center space-x-1">
                        <Shield className="w-3 h-3" />
                        <span>Real-Time Defense Ready</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">ONLINE</span>
                    </div>
                    <p className="text-[11px] text-dark-muted leading-tight">
                      Point camera at any QR or paste a link to verify security instantly.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3 Pillars Band */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-dark-surface border border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-indigo/15 text-brand-indigo flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-dark-text">1. Multi-Vector Security</h3>
            <p className="text-xs text-dark-muted leading-relaxed">
              Combines 14+ deterministic heuristic rules with Google Gemini AI for instant zero-day phishing, typosquatting, and social engineering detection.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-surface border border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-dark-text">2. Zero-Knowledge Privacy</h3>
            <p className="text-xs text-dark-muted leading-relaxed">
              Raw URLs, private WhatsApp messages, and phone numbers are NEVER stored. Only salted SHA-256 hashes and verdicts touch our database.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-surface border border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-dark-text">3. Transparent & Explainable</h3>
            <p className="text-xs text-dark-muted leading-relaxed">
              No black-box answers. Every scan outputs a calibrated 0-100 risk score, plain-language reasons, and exact signals tagged [RULE] or [AI].
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-cyan font-semibold">
            Architected For Clarity
          </span>
          <h2 className="text-3xl font-extrabold text-dark-text tracking-tight">
            How QR Shield Protects You in 3 Steps
          </h2>
          <p className="text-xs text-dark-muted">
            From physical QR stickers to deceptive SMS messages, security verification takes under two seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-6 rounded-2xl bg-dark-surface/60 border border-dark-border flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20 flex items-center justify-center font-bold text-lg">
                01
              </div>
              <h3 className="text-lg font-bold text-dark-text">Scan, Paste, or Share</h3>
              <p className="text-xs text-dark-muted leading-relaxed">
                Scan via live camera, drop an image, paste a link, or use the mobile PWA Share Target directly from WhatsApp or Messages.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-dark-border/40 text-[11px] font-mono text-dark-muted">
              Browser-side decoding • No raw image upload
            </div>
          </div>

          <div className="relative p-6 rounded-2xl bg-dark-surface/60 border border-dark-border flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 flex items-center justify-center font-bold text-lg">
                02
              </div>
              <h3 className="text-lg font-bold text-dark-text">Dual-Engine Verification</h3>
              <p className="text-xs text-dark-muted leading-relaxed">
                Rules inspect TLDs, punycode, redirects, and UPI anomalies. Gemini AI analyzes linguistic urgency, impersonation, and pretexting traps.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-dark-border/40 text-[11px] font-mono text-dark-muted">
              Rules (55%) + Gemini AI (45%) • 8s SLA
            </div>
          </div>

          <div className="relative p-6 rounded-2xl bg-dark-surface/60 border border-dark-border flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-lg">
                03
              </div>
              <h3 className="text-lg font-bold text-dark-text">Explainable Verdict Card</h3>
              <p className="text-xs text-dark-muted leading-relaxed">
                Receive an immediate Safe, Suspicious, or Dangerous rating, risk gauge score, actionable instructions, and redirect stepper.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-dark-border/40 text-[11px] font-mono text-dark-muted">
              Community Blacklist reporting • Copy report
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-dark-surface border border-dark-border space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
              Enterprise Defense for Daily Scams
            </h2>
            <p className="text-xs text-dark-muted">
              Everything required to safeguard against emerging cyber extortion and payment fraud vectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-dark-elevated/40 border border-dark-border/70 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-indigo/15 text-brand-indigo flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-dark-text">UPI Collect Scam Detection</h4>
              <p className="text-xs text-dark-muted leading-relaxed">
                Flags fraudulent QR codes designed to initiate money debits under the guise of refunds or prizes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-dark-elevated/40 border border-dark-border/70 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-cyan/15 text-brand-cyan flex items-center justify-center">
                <Link2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-dark-text">Safe Link Expander (SSRF-Protected)</h4>
              <p className="text-xs text-dark-muted leading-relaxed">
                Expands shortened URLs (bit.ly, tinyurl) server-side up to 5 hops with strict private IP and loopback blocking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-dark-elevated/40 border border-dark-border/70 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-dark-text">WhatsApp & SMS Scam NLP</h4>
              <p className="text-xs text-dark-muted leading-relaxed">
                Detects urgent electricity cutoff notices, fake courier parcels, lottery winnings, and remote-access app traps (AnyDesk).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-dark-elevated/40 border border-dark-border/70 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-dark-text">OTP Theft Alert</h4>
              <p className="text-xs text-dark-muted leading-relaxed">
                Instantly detects messages soliciting one-time passwords or bank PINs, enforcing the rule: Never share your OTP.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-dark-elevated/40 border border-dark-border/70 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-dark-text">PWA Share-to-Scan</h4>
              <p className="text-xs text-dark-muted leading-relaxed">
                Install as a progressive web app and share links directly from any Android app into QR Shield for zero-friction audits.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-dark-elevated/40 border border-dark-border/70 space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/15 text-indigo-300 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-dark-text">Community Blacklist</h4>
              <p className="text-xs text-dark-muted leading-relaxed">
                Crowdsourced scam intelligence. Domains reported by users immediately elevate danger ratings for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-text tracking-tight">
          Ready to verify before you click or pay?
        </h2>
        <p className="text-xs sm:text-sm text-dark-muted max-w-lg mx-auto">
          No sign-up required for instant scans. Guest users receive 5 free audits per day.
        </p>
        <div>
          <Link
            to="/scan"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-indigo to-brand-cyan text-white font-bold text-sm shadow-glow hover:opacity-95 transition-all"
          >
            <span>Launch Live Scanner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}

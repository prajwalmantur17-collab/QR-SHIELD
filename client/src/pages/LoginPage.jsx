import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to sign in. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl bg-dark-surface border border-dark-border shadow-2xl overflow-hidden">
        
        {/* Left Form Panel */}
        <div className="p-8 sm:p-10 space-y-6 flex flex-col justify-center">
          <div>
            <h2 className="text-2xl font-black text-dark-text tracking-tight">
              Sign In to QR Shield
            </h2>
            <p className="text-xs text-dark-muted mt-1">
              Access your personal zero-knowledge threat dashboard.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-dark-muted">Email Address</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-elevated border border-dark-border text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-indigo"
                />
                <Mail className="w-4 h-4 text-dark-muted absolute left-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-dark-muted">Password</label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-elevated border border-dark-border text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-indigo"
                />
                <Lock className="w-4 h-4 text-dark-muted absolute left-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-dark text-white font-bold shadow-glow hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-dark-muted">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-cyan font-semibold hover:underline">
              Create an account free
            </Link>
          </p>
        </div>

        {/* Right Trust Panel */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-dark-elevated via-dark-surface to-dark-bg border-l border-dark-border">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-indigo/20 text-brand-cyan flex items-center justify-center shadow-glow">
              <Shield className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold text-dark-text leading-tight">
              Zero-Knowledge Security Architecture
            </h3>

            <p className="text-xs text-dark-muted leading-relaxed">
              When you log in to QR Shield, your account is tied only to HMAC-SHA256 salted hashes. We can never view or reconstruct what links or messages you analyzed.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center space-x-2 text-dark-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>60 scans/hour authenticated rate limit</span>
              </div>
              <div className="flex items-center space-x-2 text-dark-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Personal historical telemetry & trends</span>
              </div>
              <div className="flex items-center space-x-2 text-dark-text">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>1-Click Right-to-Erasure data deletion</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] font-mono text-dark-muted">
            End-to-End Privacy Guaranteed • 2026
          </p>
        </div>

      </div>
    </div>
  );
}

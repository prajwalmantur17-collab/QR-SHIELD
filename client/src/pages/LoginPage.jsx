import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card overflow-hidden">
        
        {/* Left: Clean Login Form */}
        <div className="p-8 sm:p-10 space-y-6 flex flex-col justify-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-content-primary dark:text-dark-primary tracking-tight">
              Sign In to QR Shield
            </h2>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText mt-1">
              Access your personal zero-knowledge security dashboard.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="font-semibold text-content-primary dark:text-dark-primary">
                Email Address
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-content-primary dark:text-dark-primary placeholder:text-content-muted focus:outline-none focus:border-brand-teal transition-colors"
                />
                <Mail className="w-4 h-4 text-content-muted absolute left-3 pointer-events-none" />
              </div>
            </div>

            {/* Password Field with Visibility Toggle */}
            <div className="space-y-1.5">
              <label className="font-semibold text-content-primary dark:text-dark-primary">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-content-primary dark:text-dark-primary placeholder:text-content-muted focus:outline-none focus:border-brand-teal transition-colors"
                />
                <Lock className="w-4 h-4 text-content-muted absolute left-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="p-1 rounded text-content-muted hover:text-content-primary absolute right-2.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-brand-teal hover:bg-brand-teal-hover text-white font-semibold text-xs shadow-subtle transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-xs text-content-secondary dark:text-dark-secondaryText">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-teal font-semibold hover:underline">
              Create an account free
            </Link>
          </p>
        </div>

        {/* Right: Security Trust Panel */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-canvas-subtle dark:bg-dark-secondary border-l border-border dark:border-dark-border">
          <div className="space-y-5">
            <div className="w-10 h-10 rounded-lg bg-brand-teal text-white flex items-center justify-center shadow-subtle">
              <Shield className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-bold text-content-primary dark:text-dark-primary leading-snug">
              Enterprise Zero-Knowledge Architecture
            </h3>

            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              When you log in to QR Shield, your account is tied only to HMAC-SHA256 salted hashes. We cannot inspect or reconstruct what links or messages you analyzed.
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center space-x-2 text-content-primary dark:text-dark-primary">
                <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                <span>Elevated authenticated scan limits</span>
              </div>
              <div className="flex items-center space-x-2 text-content-primary dark:text-dark-primary">
                <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                <span>Personal historical telemetry & audit log</span>
              </div>
              <div className="flex items-center space-x-2 text-content-primary dark:text-dark-primary">
                <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                <span>1-Click Right-to-Erasure data purge</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] font-mono text-content-muted dark:text-dark-muted">
            End-to-End Privacy Guaranteed • 2026
          </p>
        </div>

      </div>
    </div>
  );
}

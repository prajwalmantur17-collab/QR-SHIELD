import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed. Please check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card padding="none" className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 shadow-elevated">
        
        {/* Left: Registration Form */}
        <div className="p-8 sm:p-10 space-y-6 flex flex-col justify-center">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="teal" size="xs">NEW ACCOUNT</Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-content-primary dark:text-dark-primary tracking-tight">
              Create Your Free Account
            </h2>
            <p className="text-xs text-content-secondary dark:text-dark-secondaryText mt-1">
              Unlock scan history, elevated rate limits, and dashboard telemetry.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-status-danger-bg border border-status-danger-border text-status-danger text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name / Alias */}
            <div className="space-y-1.5">
              <label htmlFor="register-name" className="font-semibold text-content-primary dark:text-dark-primary">
                Name
              </label>
              <div className="relative flex items-center">
                <input
                  id="register-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-content-primary dark:text-dark-primary placeholder:text-content-muted text-base sm:text-sm focus:outline-none focus:border-brand-teal transition-colors"
                />
                <User className="w-4 h-4 text-content-muted absolute left-3 pointer-events-none" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="register-email" className="font-semibold text-content-primary dark:text-dark-primary">
                Email address
              </label>
              <div className="relative flex items-center">
                <input
                  id="register-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-content-primary dark:text-dark-primary placeholder:text-content-muted text-base sm:text-sm focus:outline-none focus:border-brand-teal transition-colors"
                />
                <Mail className="w-4 h-4 text-content-muted absolute left-3 pointer-events-none" />
              </div>
            </div>

            {/* Password Field with Visibility Toggle */}
            <div className="space-y-1.5">
              <label htmlFor="register-password" className="font-semibold text-content-primary dark:text-dark-primary">
                Password (minimum 6 characters)
              </label>
              <div className="relative flex items-center">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-content-primary dark:text-dark-primary placeholder:text-content-muted text-base sm:text-sm focus:outline-none focus:border-brand-teal transition-colors"
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full"
            >
              Complete Registration
            </Button>
          </form>

          <p className="text-center text-xs text-content-secondary dark:text-dark-secondaryText">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-teal font-semibold hover:underline">
              Sign In here
            </Link>
          </p>
        </div>

        {/* Right: Security Trust Panel */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-canvas-subtle dark:bg-dark-secondary border-l border-border dark:border-dark-border">
          <div className="space-y-5">
            <div className="w-9 h-9 rounded-lg bg-brand-teal text-white flex items-center justify-center shadow-subtle">
              <Shield className="w-4.5 h-4.5" />
            </div>

            <h3 className="text-base font-bold text-content-primary dark:text-dark-primary leading-snug">
              Guaranteed Zero Content Retention
            </h3>

            <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
              We believe security scanners should never become surveillance hubs. Raw QR content, sensitive links, and text messages are processed strictly in memory and wiped immediately.
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center space-x-2 text-content-primary dark:text-dark-primary">
                <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                <span>Salted HMAC-SHA-256 fingerprinting</span>
              </div>
              <div className="flex items-center space-x-2 text-content-primary dark:text-dark-primary">
                <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                <span>Strict SSRF & Cloud Metadata Blocking</span>
              </div>
              <div className="flex items-center space-x-2 text-content-primary dark:text-dark-primary">
                <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                <span>Instant 1-Click GDPR Right-to-Erasure</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] font-mono text-content-muted dark:text-dark-muted">
            Privacy-first by design
          </p>
        </div>

      </Card>
    </div>
  );
}

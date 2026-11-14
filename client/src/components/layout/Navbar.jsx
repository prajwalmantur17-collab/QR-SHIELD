import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  QrCode, 
  LayoutDashboard, 
  BookOpen, 
  Lock, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Threat Scanner', path: '/scan', icon: QrCode },
    { name: 'Security Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Scam Awareness', path: '/awareness', icon: BookOpen },
    { name: 'Privacy Center', path: '/privacy', icon: Lock }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-md border-b border-border dark:border-dark-border transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo with QR Shield motif */}
          <Link 
            to="/" 
            className="flex items-center space-x-2.5 group focus:outline-none"
            aria-label="QR Shield Home"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center shadow-subtle group-hover:bg-brand-teal-hover transition-colors">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm tracking-tight text-content-primary dark:text-dark-primary">
                  QR <span className="text-brand-teal">SHIELD</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-teal-subtle text-brand-teal font-semibold">
                  SaaS
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted dark:text-dark-muted -mt-0.5">
                Zero-Knowledge Defense
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-brand-teal-subtle dark:bg-dark-secondary text-brand-teal'
                      : 'text-content-secondary dark:text-dark-secondaryText hover:text-content-primary dark:hover:text-dark-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Theme Toggle & Auth */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="p-2 rounded-lg text-content-secondary dark:text-dark-secondaryText hover:text-content-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary border border-border dark:border-dark-border transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface hover:bg-canvas-subtle dark:hover:bg-dark-secondary text-xs font-medium text-content-primary dark:text-dark-primary transition-colors"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-5 h-5 rounded-md bg-brand-teal text-white font-semibold text-[11px] flex items-center justify-center">
                    {user?.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate text-xs font-medium">
                    {user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-content-muted" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-dropdown py-1.5 z-50">
                    <div className="px-3.5 py-2 border-b border-border dark:border-dark-border">
                      <p className="text-[10px] text-content-muted uppercase font-mono font-semibold">Account</p>
                      <p className="text-xs font-semibold text-content-primary dark:text-dark-primary truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-content-secondary hover:text-content-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Security Dashboard</span>
                    </Link>
                    <Link
                      to="/privacy"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-content-secondary hover:text-content-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Privacy Center</span>
                    </Link>
                    <div className="border-t border-border dark:border-dark-border my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-status-danger hover:bg-status-danger-bg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-content-secondary hover:text-content-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/scan">
                  <Button size="sm" variant="primary" icon={ArrowRight} iconPosition="right">
                    Open Scanner
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-content-secondary border border-border"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-canvas-subtle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-white dark:bg-dark-surface px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-content-primary hover:bg-canvas-subtle"
            >
              <link.icon className="w-4 h-4 text-brand-teal" />
              <span>{link.name}</span>
            </Link>
          ))}
          <div className="border-t border-border pt-2 flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" variant="secondary" className="w-full">Sign In</Button>
                </Link>
                <Link to="/scan" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" variant="primary" className="w-full">Open Scanner</Button>
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-status-danger hover:bg-status-danger-bg rounded-lg"
              >
                Sign Out ({user?.email})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

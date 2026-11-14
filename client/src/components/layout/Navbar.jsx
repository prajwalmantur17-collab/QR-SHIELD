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
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Scan', path: '/scan', icon: QrCode },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Awareness', path: '/awareness', icon: BookOpen },
    { name: 'Privacy Center', path: '/privacy', icon: Lock }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark-surface border-b border-border dark:border-dark-border transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo with QR Shield motif */}
          <Link 
            to="/" 
            className="flex items-center space-x-2.5 group focus:outline-none"
            aria-label="QR Shield Home"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-teal text-white flex items-center justify-center shadow-subtle group-hover:bg-brand-teal-hover transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-content-primary dark:text-dark-primary flex items-center">
                QR <span className="text-brand-teal ml-1">SHIELD</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-content-muted dark:text-dark-muted -mt-1 font-mono">
                Digital Safety
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
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-teal-subtle dark:bg-dark-secondary text-brand-teal dark:text-brand-teal'
                      : 'text-content-secondary dark:text-dark-secondaryText hover:text-content-primary dark:hover:text-dark-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Theme Toggle & Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="p-2 rounded-lg text-content-secondary dark:text-dark-secondaryText hover:text-content-primary dark:hover:text-dark-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary border border-border dark:border-dark-border transition-colors"
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
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface hover:bg-canvas-subtle dark:hover:bg-dark-secondary text-sm font-medium text-content-primary dark:text-dark-primary transition-colors"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-brand-teal-subtle text-brand-teal font-semibold text-xs flex items-center justify-center">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[130px] truncate text-xs font-medium">
                    {user?.name || user?.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-content-muted" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-dropdown py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-border dark:border-dark-border">
                      <p className="text-xs text-content-muted dark:text-dark-muted font-medium">Signed in as</p>
                      <p className="text-xs font-semibold text-content-primary dark:text-dark-primary truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-content-secondary dark:text-dark-secondaryText hover:text-content-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Security Dashboard</span>
                    </Link>
                    <Link
                      to="/privacy"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-content-secondary dark:text-dark-secondaryText hover:text-content-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Privacy Controls</span>
                    </Link>
                    <div className="border-t border-border dark:border-dark-border my-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-medium text-status-danger hover:bg-status-danger-bg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-content-secondary dark:text-dark-secondaryText hover:text-content-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-brand-teal text-white hover:bg-brand-teal-hover shadow-subtle transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-content-secondary border border-border dark:border-dark-border"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="p-2 rounded-lg text-content-secondary border border-border dark:border-dark-border"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-brand-teal-subtle text-brand-teal font-semibold'
                    : 'text-content-secondary hover:text-content-primary hover:bg-canvas-subtle'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-3 border-t border-border dark:border-dark-border">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1 text-xs text-content-muted">
                  Signed in as <span className="font-semibold text-content-primary">{user?.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-status-danger bg-status-danger-bg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-3 py-2 rounded-lg border border-border text-xs font-semibold text-content-primary"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-3 py-2 rounded-lg bg-brand-teal text-xs font-semibold text-white shadow-subtle"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Thumb Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-surface border-t border-border dark:border-dark-border px-2 py-1.5 flex justify-around items-center">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                active ? 'text-brand-teal font-semibold' : 'text-content-muted hover:text-content-primary'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}

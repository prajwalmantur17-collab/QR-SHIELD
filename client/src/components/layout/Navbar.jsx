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
  ExternalLink
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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-dark-bg/80 dark:bg-dark-bg/85 border-b border-dark-border dark:border-dark-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo with QR Shield motif */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-cyan flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-6 h-6 text-white" />
              {/* Corner QR reticles */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/80 rounded-tl-sm"></div>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-white/80 rounded-tr-sm"></div>
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-white/80 rounded-bl-sm"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-white to-dark-muted dark:from-white dark:to-dark-muted bg-clip-text text-transparent">
                QR <span className="text-brand-cyan">SHIELD</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-brand-cyan/80 -mt-1 font-semibold">
                AI Defense
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-brand-indigo/15 text-brand-cyan border border-brand-indigo/30'
                      : 'text-dark-muted hover:text-dark-text hover:bg-dark-surface/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-brand-cyan' : 'text-dark-muted'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Theme Toggle & Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl text-dark-muted hover:text-dark-text hover:bg-dark-surface/60 border border-dark-border/40 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-brand-indigo" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-dark-surface border border-dark-border hover:border-brand-indigo/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-indigo/20 flex items-center justify-center text-brand-cyan font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium text-dark-text max-w-[120px] truncate">
                    {user?.name || user?.email}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-dark-surface border border-dark-border shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-dark-border/60">
                      <p className="text-xs text-dark-muted">Signed in as</p>
                      <p className="text-sm font-semibold text-dark-text truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-dark-muted hover:text-dark-text hover:bg-dark-elevated"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>My Scans</span>
                    </Link>
                    <Link
                      to="/privacy"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-dark-muted hover:text-dark-text hover:bg-dark-elevated"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Privacy Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-verdict-dangerous hover:bg-verdict-dangerous/10 transition-colors"
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
                  className="px-3.5 py-1.5 text-sm font-medium text-dark-muted hover:text-dark-text transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-brand-indigo to-brand-dark text-white shadow-glow hover:opacity-95 transition-all"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-dark-muted hover:text-dark-text border border-dark-border/40"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-indigo" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-dark-muted hover:text-dark-text border border-dark-border"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-dark-border bg-dark-bg/95 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  active
                    ? 'bg-brand-indigo/15 text-brand-cyan border border-brand-indigo/30'
                    : 'text-dark-muted hover:text-dark-text hover:bg-dark-surface'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-3 border-t border-dark-border/60">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-4 py-1 text-xs text-dark-muted">
                  Signed in as <span className="font-semibold text-dark-text">{user?.email}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-verdict-dangerous bg-verdict-dangerous/10"
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
                  className="text-center px-4 py-2.5 rounded-xl border border-dark-border text-sm font-medium text-dark-text"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 rounded-xl bg-brand-indigo text-sm font-semibold text-white shadow-glow"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar (Fast Thumb Access) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg bg-dark-bg/95 border-t border-dark-border/80 px-2 py-1.5 flex justify-around items-center">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                active ? 'text-brand-cyan' : 'text-dark-muted'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${active ? 'text-brand-cyan' : 'text-dark-muted'}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}

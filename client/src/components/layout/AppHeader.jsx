import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  Shield, 
  QrCode, 
  Search, 
  ChevronRight, 
  ExternalLink,
  Plus, 
  Sun, 
  Moon,
  Sparkles,
  PanelLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function AppHeader({ onOpenMobile, onToggleCollapse, isCollapsed }) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Route title & breadcrumb mapping
  const routeMeta = {
    '/scan': { section: 'Detection', title: 'Threat Scanner' },
    '/dashboard': { section: 'Intelligence', title: 'Security Dashboard' },
    '/awareness': { section: 'Education', title: 'Scam Awareness' },
    '/privacy': { section: 'Governance', title: 'Privacy Center' },
    '/share': { section: 'PWA Integration', title: 'Quick Share Target' },
    '/login': { section: 'Account', title: 'Sign In' },
    '/register': { section: 'Account', title: 'Create Account' }
  };

  const currentMeta = routeMeta[location.pathname] || { section: 'QR Shield', title: 'Digital Safety' };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-border dark:border-dark-border px-4 sm:px-6 transition-colors">
      <div className="flex items-center justify-between h-full">
        
        {/* Left: Hamburger (Mobile) / Sidebar Toggle + Breadcrumb */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={onOpenMobile}
            aria-label="Open Navigation Menu"
            className="md:hidden p-1.5 rounded-lg text-content-secondary hover:text-content-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Sidebar Toggle icon */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Toggle Sidebar"
            className="hidden md:flex p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary transition-colors"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Breadcrumb Hierarchy */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs">
            <Link 
              to="/" 
              className="text-content-muted hover:text-content-primary transition-colors hidden sm:inline"
            >
              QR Shield
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-content-muted hidden sm:inline" />
            <span className="text-content-muted hidden sm:inline">{currentMeta.section}</span>
            <ChevronRight className="w-3.5 h-3.5 text-content-muted hidden sm:inline" />
            <span className="font-semibold text-content-primary dark:text-dark-primary tracking-tight">
              {currentMeta.title}
            </span>
          </nav>
        </div>

        {/* Right: Engine Status & Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Real-time System Status Pill */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-status-success-bg border border-status-success-border text-status-success-text text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            <span>SSRF Guard: Active</span>
          </div>

          {/* Quick "New Scan" shortcut */}
          {location.pathname !== '/scan' && (
            <Link to="/scan">
              <Button size="xs" variant="primary" icon={Plus}>
                New Scan
              </Button>
            </Link>
          )}

          {/* User Sign In / Profile Quick Link */}
          {!isAuthenticated ? (
            <Link to="/login" className="hidden sm:inline-block">
              <Button size="xs" variant="secondary">
                Sign In
              </Button>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <div 
                className="w-7 h-7 rounded-lg bg-brand-teal text-white flex items-center justify-center font-bold text-xs select-none shadow-subtle"
                title={user?.email}
              >
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

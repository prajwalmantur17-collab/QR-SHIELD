import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  ChevronRight, 
  Plus, 
  Activity 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import AccountMenu from './AccountMenu';
import api from '../../api/client';

export default function AppHeader({ onOpenMobile }) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [engineOnline, setEngineOnline] = useState(true);

  // Poll engine health on mount and every 60s
  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        await api.get('/health');
        if (mounted) setEngineOnline(true);
      } catch {
        if (mounted) setEngineOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Route title & breadcrumb mapping aligned with sidebar groups
  const routeMeta = {
    '/scan': { section: 'Core Detection', title: 'Threat Scanner' },
    '/media': { section: 'Core Detection', title: 'Media Authenticity' },
    '/share': { section: 'Core Detection', title: 'Quick Share Target' },
    '/dashboard': { section: 'Intelligence & Audit', title: 'Security Dashboard' },
    '/awareness': { section: 'Education & Defense', title: 'Scam Awareness' },
    '/privacy': { section: 'Trust & Governance', title: 'Privacy Center' }
  };

  const currentMeta = routeMeta[location.pathname] || { section: 'Core Detection', title: 'Digital Safety' };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-b border-border dark:border-dark-border px-4 sm:px-6 transition-colors">
      <div className="flex items-center justify-between h-full">
        
        {/* Left: Mobile Drawer Trigger + Breadcrumb */}
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
          {/* Real-time System Status Pill driven by api.get('/health') */}
          <div 
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-colors ${
              engineOnline === false
                ? 'bg-status-danger-bg border-status-danger-border text-status-danger'
                : 'bg-status-success-bg border-status-success-border text-status-success-text'
            }`}
            title={engineOnline === false ? 'Engine offline' : 'Engine online'}
          >
            <Activity className={`w-3.5 h-3.5 flex-shrink-0 ${engineOnline === false ? 'text-status-danger' : 'text-status-success'}`} />
            <span className="hidden lg:inline">
              {engineOnline === false ? 'Engine offline' : 'Engine online'}
            </span>
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
            <AccountMenu compact={true} />
          )}
        </div>

      </div>
    </header>
  );
}

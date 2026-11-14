import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  QrCode, 
  LayoutDashboard, 
  BookOpen, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  ScanSearch,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Navigation structure organized by enterprise domains
  const navGroups = [
    {
      group: 'Core Detection',
      items: [
        {
          id: 'scan',
          name: 'Threat Scanner',
          path: '/scan',
          icon: QrCode
        },
        {
          id: 'media',
          name: 'Media Authenticity',
          path: '/media',
          icon: ScanSearch,
          badge: 'Local',
          badgeVariant: 'teal'
        }
      ]
    },
    {
      group: 'Intelligence & Audit',
      items: [
        {
          id: 'dashboard',
          name: 'Security Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard
        }
      ]
    },
    {
      group: 'Education & Defense',
      items: [
        {
          id: 'awareness',
          name: 'Scam Awareness',
          path: '/awareness',
          icon: BookOpen
        }
      ]
    },
    {
      group: 'Trust & Governance',
      items: [
        {
          id: 'privacy',
          name: 'Privacy Center',
          path: '/privacy',
          icon: Lock
        }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  // Close the mobile drawer with the Escape key
  useEffect(() => {
    if (!isMobileOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCloseMobile();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  // Rendered as a function so the mobile drawer can ALWAYS be shown expanded, even when the
  // desktop sidebar was collapsed to icons (that preference is persisted in localStorage and
  // previously leaked into the drawer, leaving mobile users with an icon-only, unlabeled menu).
  const renderSidebar = (isCollapsed) => (
    <div className="flex flex-col h-full bg-white dark:bg-dark-surface border-r border-border dark:border-dark-border select-none transition-all duration-200">
      
      {/* 1. Brand Logo & Collapse Toggle */}
      <div className={`flex items-center h-16 border-b border-border dark:border-dark-border px-4 ${
        isCollapsed ? 'justify-center' : 'justify-between'
      }`}>
        <Link 
          to="/" 
          onClick={onCloseMobile}
          className="flex items-center space-x-2.5 focus:outline-none group overflow-hidden"
          title="QR Shield Home"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center shadow-subtle group-hover:bg-brand-teal-hover transition-colors flex-shrink-0">
            <Shield className="w-4.5 h-4.5" />
          </div>

          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col whitespace-nowrap"
            >
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm tracking-tight text-content-primary dark:text-dark-primary">
                  QR <span className="text-brand-teal">SHIELD</span>
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted dark:text-dark-muted -mt-0.5">
                Digital Safety
              </span>
            </motion.div>
          )}
        </Link>

        {/* Desktop Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="hidden md:flex p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 2. Structured Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {/* Group Label */}
            {!isCollapsed ? (
              <h4 className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-content-muted dark:text-dark-muted font-mono">
                {group.group}
              </h4>
            ) : (
              <div className="w-4 h-0.5 bg-border dark:bg-dark-border mx-auto my-2 rounded-full" />
            )}

            {/* Navigation Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.name : undefined}
                    aria-label={isCollapsed ? item.name : undefined}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center rounded-lg font-medium text-xs transition-all duration-150 group ${
                      isCollapsed 
                        ? 'justify-center p-2.5' 
                        : 'px-3 py-2 space-x-2.5'
                    } ${
                      active
                        ? 'bg-brand-teal-subtle dark:bg-dark-secondary text-brand-teal font-semibold shadow-hairline'
                        : 'text-content-secondary dark:text-dark-secondaryText hover:text-content-primary dark:hover:text-dark-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary'
                    }`}
                  >
                    {/* Active vertical accent pill on left */}
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-brand-teal rounded-r-full" />
                    )}

                    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      active ? 'text-brand-teal' : 'text-content-muted group-hover:text-content-primary'
                    }`} />

                    {!isCollapsed && (
                      <span className="flex-1 truncate tracking-tight">{item.name}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        item.badgeVariant === 'teal'
                          ? 'bg-brand-teal text-white font-bold'
                          : active
                            ? 'bg-white dark:bg-dark-surface text-brand-teal font-semibold'
                            : 'bg-canvas-subtle dark:bg-dark-secondary text-content-muted font-medium'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom User Profile & Theme Section */}
      <div className="p-3 border-t border-border dark:border-dark-border space-y-2">
        {/* Theme switcher */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!isCollapsed && (
            <span className="text-xs text-content-secondary dark:text-dark-secondaryText">Theme</span>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-1.5 rounded-lg text-content-secondary hover:text-content-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>

        {/* User Card */}
        {isAuthenticated ? (
          <div className={`flex items-center rounded-xl bg-canvas-subtle dark:bg-dark-secondary p-2 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}>
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-brand-teal text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-semibold text-content-primary dark:text-dark-primary truncate">
                    {user?.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-content-muted truncate">
                    Verified User
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                className="p-1 text-content-muted hover:text-status-danger transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className={isCollapsed ? 'flex justify-center' : ''}>
            <Link
              to="/login"
              onClick={onCloseMobile}
              className={`flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                isCollapsed
                  ? 'p-2 text-brand-teal hover:bg-brand-teal-subtle'
                  : 'w-full py-2 px-3 bg-brand-teal text-white hover:bg-brand-teal-hover shadow-subtle'
              }`}
              title="Sign In"
            >
              <User className="w-3.5 h-3.5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-1.5">Sign In</span>}
            </Link>
          </div>
        )}
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 bottom-0 left-0 z-40 transition-all duration-200 ${
          isCollapsed ? 'w-[68px]' : 'w-[248px]'
        }`}
      >
        {renderSidebar(isCollapsed)}
      </aside>

      {/* Mobile Slide-over Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="relative w-64 max-w-[80vw] h-full z-10"
            >
              {renderSidebar(false)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

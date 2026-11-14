import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Lock, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AccountMenu({ compact = false }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointerDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  if (!isAuthenticated) return null;

  const initial = user?.email ? user.email[0].toUpperCase() : 'U';
  const username = user?.email?.split('@')[0] || 'User';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Account menu"
        className={`flex items-center space-x-2 rounded-lg transition-colors focus:outline-none ${
          compact
            ? 'p-1 hover:bg-canvas-subtle dark:hover:bg-dark-secondary'
            : 'px-2.5 py-1.5 border border-border dark:border-dark-border bg-canvas-subtle dark:bg-dark-secondary hover:bg-canvas text-content-primary dark:text-dark-primary'
        }`}
      >
        <div className="w-7 h-7 rounded-lg bg-brand-teal text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-subtle select-none">
          {initial}
        </div>
        {!compact && (
          <>
            <span className="max-w-[120px] truncate text-xs font-semibold">
              {username}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-content-muted" />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-dropdown py-1.5 z-50">
          <div className="px-3.5 py-2 border-b border-border dark:border-dark-border">
            <p className="text-[10px] text-content-muted uppercase font-mono font-semibold">Account</p>
            <p className="text-xs font-semibold text-content-primary dark:text-dark-primary truncate">{user?.email}</p>
          </div>
          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-content-secondary hover:text-content-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Security Dashboard</span>
          </Link>
          <Link
            to="/privacy"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-content-secondary hover:text-content-primary hover:bg-canvas-subtle dark:hover:bg-dark-secondary transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Center</span>
          </Link>
          <div className="border-t border-border dark:border-dark-border my-1" />
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
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
  );
}

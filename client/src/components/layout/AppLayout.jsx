import React, { useState, useEffect, Suspense } from 'react';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';

export default function AppLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('qrshield_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('qrshield_sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-dark-bg text-content-primary dark:text-dark-primary flex">
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-1.5 focus:rounded-lg focus:bg-brand-teal focus:text-white focus:text-xs focus:font-semibold focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* 1. Sidebar Component (Desktop persistent + Mobile drawer) */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* 2. Main Content Canvas */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isCollapsed ? 'md:ml-[68px]' : 'md:ml-[248px]'
        }`}
      >
        <AppHeader
          onOpenMobile={() => setIsMobileOpen(true)}
          onToggleCollapse={toggleCollapse}
          isCollapsed={isCollapsed}
        />

        <main id="main-content" tabIndex="-1" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto focus:outline-none">
          <Suspense
            fallback={
              <div
                role="status"
                aria-live="polite"
                className="min-h-[40vh] flex items-center justify-center"
              >
                <span className="w-6 h-6 rounded-full border-2 border-brand-teal border-t-transparent animate-spin" />
                <span className="sr-only">Loading page...</span>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

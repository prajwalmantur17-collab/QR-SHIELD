import React, { useState, useEffect } from 'react';
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Enterprise Segmented Tab Switcher
 */
export default function Tabs({
  tabs = [], // [{ id, label, icon: Icon, badge }]
  activeTab,
  onChange,
  className = '',
  size = 'md'
}) {
  const sizeStyles = {
    sm: 'p-0.5 text-xs gap-0.5',
    md: 'p-1 text-xs gap-1',
    lg: 'p-1.5 text-sm gap-1.5'
  };

  const buttonSizeStyles = {
    sm: 'py-1 px-2.5',
    md: 'py-1.5 px-3.5',
    lg: 'py-2 px-4'
  };

  return (
    <div
      role="tablist"
      className={`inline-flex items-center rounded-xl bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center justify-center space-x-1.5 font-semibold rounded-lg transition-colors duration-150 select-none focus:outline-none ${buttonSizeStyles[size] || buttonSizeStyles.md} ${
              isActive
                ? 'text-content-primary dark:text-dark-primary'
                : 'text-content-secondary dark:text-dark-secondaryText hover:text-content-primary dark:hover:text-dark-primary'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-white dark:bg-dark-surface rounded-lg shadow-subtle border border-border/80 dark:border-dark-border"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center space-x-1.5">
              {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isActive
                    ? 'bg-brand-teal/10 text-brand-teal font-bold'
                    : 'bg-canvas dark:bg-dark-bg text-content-muted'
                }`}>
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

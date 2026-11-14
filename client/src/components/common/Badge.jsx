import React from 'react';

/**
 * Enterprise Design System Badge
 * Variants: safe | suspicious | dangerous | neutral | teal | blue
 * Sizes: xs | sm | md
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  icon: Icon,
  className = ''
}) {
  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 rounded gap-1 font-medium',
    sm: 'text-[11px] px-2.5 py-0.5 rounded-md gap-1.5 font-medium tracking-tight',
    md: 'text-xs px-3 py-1 rounded-md gap-1.5 font-semibold'
  };

  const variantStyles = {
    safe: 'bg-status-success-bg text-status-success-text border border-status-success-border',
    suspicious: 'bg-status-warning-bg text-status-warning-text border border-status-warning-border',
    dangerous: 'bg-status-danger-bg text-status-danger-text border border-status-danger-border',
    teal: 'bg-brand-teal-subtle text-brand-teal-text dark:text-brand-teal border border-brand-teal/20',
    blue: 'bg-brand-blue-subtle text-brand-blue-text dark:text-brand-blue border border-brand-blue/20',
    neutral: 'bg-canvas-subtle dark:bg-dark-secondary text-content-secondary dark:text-dark-secondaryText border border-border dark:border-dark-border',
    outline: 'bg-transparent text-content-primary dark:text-dark-primary border border-border dark:border-dark-border'
  };

  const dotColors = {
    safe: 'bg-status-success',
    suspicious: 'bg-status-warning',
    dangerous: 'bg-status-danger',
    teal: 'bg-brand-teal',
    blue: 'bg-brand-blue',
    neutral: 'bg-content-muted',
    outline: 'bg-content-muted'
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-mono select-none ${sizeStyles[size] || sizeStyles.sm} ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant] || 'bg-content-muted'}`} />
      )}
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

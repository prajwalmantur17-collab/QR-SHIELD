import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Enterprise Design System Button
 * Variants: primary | secondary | outline | ghost | danger
 * Sizes: xs | sm | md | lg
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = {
    xs: 'text-[11px] px-2.5 py-1 rounded-md gap-1.5 font-medium',
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-medium',
    md: 'text-xs px-3.5 py-2 rounded-lg gap-2 font-semibold',
    lg: 'text-sm px-4.5 py-2.5 rounded-xl gap-2 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-brand-teal hover:bg-brand-teal-hover active:bg-brand-teal-active text-white shadow-subtle border border-brand-teal/30',
    secondary: 'bg-canvas-subtle hover:bg-canvas text-content-primary dark:bg-dark-secondary dark:hover:bg-dark-surface dark:text-dark-primary border border-border dark:border-dark-border',
    outline: 'bg-white hover:bg-canvas-subtle text-content-primary dark:bg-dark-surface dark:hover:bg-dark-secondary dark:text-dark-primary border border-border dark:border-dark-border shadow-hairline',
    ghost: 'bg-transparent hover:bg-canvas-subtle dark:hover:bg-dark-secondary text-content-secondary hover:text-content-primary dark:text-dark-secondaryText dark:hover:text-dark-primary',
    danger: 'bg-status-danger-bg hover:bg-red-100 text-status-danger border border-status-danger-border',
    dangerSolid: 'bg-status-danger hover:bg-red-700 text-white shadow-subtle',
    tealSubtle: 'bg-brand-teal-subtle hover:bg-brand-teal/20 text-brand-teal border border-brand-teal/20'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      )}
      
      {children && <span>{children}</span>}

      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      )}
    </button>
  );
}

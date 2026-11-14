import React from 'react';

/**
 * Enterprise Design System Card
 * Elevation: flat | subtle | elevated | interactive
 */
export default function Card({
  children,
  className = '',
  elevation = 'subtle',
  hoverEffect = false,
  padding = 'md',
  as: Component = 'div',
  ...props
}) {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3.5 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const elevationStyles = {
    flat: 'bg-white dark:bg-dark-surface border border-border dark:border-dark-border',
    subtle: 'bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-card',
    elevated: 'bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-elevated',
    subtleCanvas: 'bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border',
  };

  const hoverClass = hoverEffect
    ? 'transition-all duration-200 hover:border-border-strong dark:hover:border-slate-600 hover:shadow-card-hover'
    : '';

  return (
    <Component
      className={`rounded-2xl overflow-hidden ${elevationStyles[elevation] || elevationStyles.subtle} ${paddingStyles[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ title, description, badge, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 pb-4 border-b border-border dark:border-dark-border ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-content-primary dark:text-dark-primary tracking-tight">
            {title}
          </h3>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

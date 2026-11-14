import React from 'react';

/**
 * Standard Enterprise Page Header
 * Consistent H1 scale, description typography, and action slot
 */
export default function PageHeader({ title, description, right, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border dark:border-dark-border ${className}`}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-content-primary dark:text-dark-primary">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-content-secondary dark:text-dark-secondaryText max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {right && (
        <div className="flex items-center space-x-2 flex-shrink-0">
          {right}
        </div>
      )}
    </div>
  );
}

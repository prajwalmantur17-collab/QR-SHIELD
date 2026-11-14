import React from 'react';
import { ShieldAlert, Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is no data to display right now.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-canvas-subtle/50 dark:bg-dark-secondary/30 border border-dashed border-border dark:border-dark-border ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border flex items-center justify-center text-content-muted shadow-subtle mb-3.5">
        <Icon className="w-5 h-5 text-brand-teal" />
      </div>
      <h4 className="text-sm font-semibold text-content-primary dark:text-dark-primary mb-1">
        {title}
      </h4>
      <p className="text-xs text-content-secondary dark:text-dark-secondaryText max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

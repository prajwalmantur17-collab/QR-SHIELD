import React from 'react';

export function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return (
    <div className={`animate-shimmer bg-slate-200 dark:bg-slate-700/50 ${rounded} ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}

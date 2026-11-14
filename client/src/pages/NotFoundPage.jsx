import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import usePageTitle from '../hooks/usePageTitle';

export default function NotFoundPage() {
  usePageTitle('Page Not Found');

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-canvas-subtle dark:bg-dark-secondary text-brand-teal flex items-center justify-center mx-auto border border-border dark:border-dark-border shadow-subtle">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-content-primary dark:text-dark-primary">
            404 - Page not found
          </h1>
          <p className="text-xs text-content-secondary dark:text-dark-secondaryText leading-relaxed">
            The security route you requested does not exist or has been relocated.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/scan">
            <Button variant="primary" size="md" icon={ArrowLeft}>
              Return to Threat Scanner
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

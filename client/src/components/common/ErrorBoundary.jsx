import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('QR Shield ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas dark:bg-dark-bg text-content-primary dark:text-dark-primary flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-white dark:bg-dark-surface border border-border dark:border-dark-border shadow-elevation text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-status-danger-bg text-status-danger flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-content-primary dark:text-dark-primary">
                Something went wrong
              </h2>
              <p className="text-xs text-content-secondary dark:text-dark-secondaryText">
                An unexpected interface error occurred. You can safely reload the page or return to home.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-canvas-subtle dark:bg-dark-secondary border border-border dark:border-dark-border text-left font-mono text-[11px] text-status-danger break-all max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-teal text-white hover:bg-brand-teal-hover transition-colors shadow-subtle"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-canvas-subtle dark:bg-dark-secondary text-content-primary dark:text-dark-primary hover:bg-canvas border border-border dark:border-dark-border transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

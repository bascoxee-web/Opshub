'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class PartnerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    let readable = error.message || 'An unexpected error occurred.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === 'string') {
        readable = `${parsed.error}${parsed.path ? ` (${parsed.operationType} on ${parsed.path})` : ''}`;
      }
    } catch {
      // keep raw message
    }
    return { hasError: true, errorMessage: readable };
  }

  componentDidCatch(error: Error) {
    console.error('PartnerHub ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Workspace Connection Notice
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {this.state.errorMessage}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              If you just signed in with a new email, confirm your email is verified and added to the Authorized Partners list by the workspace admin.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                if (typeof window !== 'undefined') window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-teal-500 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Partner Hub</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

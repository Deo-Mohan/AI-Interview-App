import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Card, Badge } from './ui';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  name?: string;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  compact?: boolean;
  resetKeys?: any[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

/**
 * Resilient Error Boundary Component
 * Prevents a single component crash from breaking or closing the rest of the application.
 * Provides tactile recovery controls and graceful fallback states.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error(`[ErrorBoundary:${this.props.name || 'Component'}] Captured error:`, error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || [];
      const currentKeys = this.props.resetKeys;
      const hasChanged = currentKeys.length !== prevKeys.length || currentKeys.some((k, i) => k !== prevKeys[i]);
      if (hasChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  public resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
  };

  public toggleDetails = (): void => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      const { fallback, name, compact } = this.props;
      const { error, showDetails, errorInfo } = this.state;

      // Custom fallback function or node
      if (typeof fallback === 'function') {
        return fallback(error || new Error('Unknown component crash'), this.resetErrorBoundary);
      }
      if (fallback) {
        return fallback;
      }

      // Compact inline fallback for small widgets / cards
      if (compact) {
        return (
          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/80 text-rose-900 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span className="font-semibold truncate">
                {name ? `${name} failed to load` : 'Component failed to load'}
              </span>
            </div>
            <button
              onClick={this.resetErrorBoundary}
              className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="size-3" /> Retry
            </button>
          </div>
        );
      }

      // Standard EventLooped-styled fallback card
      return (
        <Card variant="subtle" className="border-rose-200 bg-rose-50/70 p-6 my-2 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 border border-rose-200">
                <ShieldAlert className="size-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-rose-950">
                    {name ? `${name} Encountered an Error` : 'Something Went Wrong in This Component'}
                  </h4>
                  <Badge variant="rose" size="sm">Isolated Failure</Badge>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed max-w-lg">
                  An isolated error occurred inside this section. The rest of the application remains fully active and safe.
                </p>
                {error && (
                  <p className="text-[11px] font-mono text-rose-700 bg-white/60 px-2 py-1 rounded border border-rose-200/60 inline-block mt-1">
                    {error.message || 'Unknown runtime error'}
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={this.resetErrorBoundary}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 hover:text-rose-900 shrink-0"
              icon={<RotateCcw className="size-3.5" />}
            >
              Try Again
            </Button>
          </div>

          {/* Optional Collapsible Technical Details */}
          {errorInfo && (
            <div className="border-t border-rose-200/60 pt-3">
              <button
                onClick={this.toggleDetails}
                className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1"
              >
                {showDetails ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                {showDetails ? 'Hide technical trace' : 'Show technical trace'}
              </button>
              {showDetails && (
                <pre className="mt-2 text-[10px] font-mono text-rose-800 bg-rose-900/5 p-3 rounded-lg overflow-x-auto max-h-40 leading-normal border border-rose-200/60">
                  {error?.stack}
                  {'\n\nComponent Stack:'}
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
        </Card>
      );
    }

    return this.props.children;
  }
}

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  /** When this value changes, the boundary resets (e.g. pass the active tab so
   *  navigating away from a crashed screen recovers automatically). */
  resetKey?: unknown;
  label?: string;
}
interface State {
  error: Error | null;
}

/**
 * Catches render/lifecycle errors in the subtree and shows a contained fallback
 * instead of unmounting the whole app to a blank screen. Wraps the main content
 * region so the sidebar stays usable and the user can navigate away.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface for debugging; in production this would go to an error reporter.
    console.error('[ErrorBoundary] Caught a render error:', error, info);
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="bg-brand-offWhite border border-brand-sandBorder rounded-xl shadow-sm p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-warningBg text-brand-warningText grid place-items-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-brand-darkCharcoal mb-1">
              {this.props.label || 'Something went wrong on this screen'}
            </h2>
            <p className="text-sm text-brand-mutedSlate mb-1">
              The rest of the app is still working — switch to another section, or try again.
            </p>
            <p className="text-xs font-mono text-brand-mutedSlate/80 break-words mb-5">
              {this.state.error.message}
            </p>
            <button
              onClick={() => this.setState({ error: null })}
              className="inline-flex items-center gap-2 bg-brand-darkTeal hover:bg-brand-teal text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

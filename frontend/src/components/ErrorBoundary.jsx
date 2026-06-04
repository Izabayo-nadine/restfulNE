import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
          <div className="card max-w-lg">
            <h2 className="text-lg font-bold text-red-800">Something went wrong</h2>
            <p className="mt-2 text-sm text-slate-600">{this.state.error.message}</p>
            <button
              type="button"
              className="btn-primary mt-4"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

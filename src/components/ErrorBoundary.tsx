import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">
              Une erreur s'est produite
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              L'application a rencontré une erreur inattendue. Veuillez recharger la page.
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#e67e22] text-white rounded-md hover:bg-[#d35400] transition-colors"
              >
                Recharger la page
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Réessayer
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 p-4 bg-gray-50 rounded-md">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Détails de l'erreur (développement)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
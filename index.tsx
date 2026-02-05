import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// --- CRITICAL POLYFILLS FOR VITE/BROWSER COMPATIBILITY ---
if (typeof window !== 'undefined') {
  // Polyfill global
  if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
  }
  
  // Polyfill process
  if (typeof (window as any).process === 'undefined') {
    (window as any).process = { env: {} };
  }

  // Polyfill Buffer (Essential for 'siwe' and 'ethers')
  if (typeof (window as any).Buffer === 'undefined') {
    (window as any).Buffer = {
      isBuffer: (obj: any) => {
        return obj && obj.constructor && (obj.constructor.name === 'Buffer' || obj.constructor.name === 'Uint8Array');
      },
      from: (data: any, encoding?: string) => {
        if (typeof data === 'string') {
          return new TextEncoder().encode(data);
        }
        return new Uint8Array(data);
      },
      alloc: (size: number) => new Uint8Array(size),
    };
  }
}
// ---------------------------------------------------------

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly declare state property to satisfy TypeScript requirements
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };
  
  // Fix: Explicitly declare props to satisfy TS compiler in strict environments
  declare props: Readonly<ErrorBoundaryProps>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Critical App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          backgroundColor: '#050505',
          color: '#ef4444',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{fontSize: '24px', marginBottom: '20px'}}>P3 System Malfunction</h1>
          <p style={{color: '#a1a1aa', marginBottom: '20px'}}>
            A critical error prevented the interface from loading.
          </p>
          <div style={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            padding: '15px',
            borderRadius: '8px',
            maxWidth: '600px',
            overflow: 'auto'
          }}>
            {this.state.error?.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '30px',
              padding: '10px 20px',
              backgroundColor: '#00e599',
              color: 'black',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reboot System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Unregister the service worker to avoid "document in invalid state" errors
serviceWorkerRegistration.unregister();
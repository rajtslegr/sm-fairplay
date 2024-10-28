import React from 'react';

import App from '@App';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';

import ErrorBoundary from '@components/ErrorBoundary';

import '@index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster
        position="bottom-right"
        theme="dark"
        duration={2000}
        closeButton
        richColors
        toastOptions={{
          className: 'font-inter',
          style: {
            background: '#1a1a1a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          },
        }}
      />
    </ErrorBoundary>
  </React.StrictMode>,
);

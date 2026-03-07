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
        theme="system"
        duration={2000}
        closeButton
        richColors
        toastOptions={{
          className: 'font-inter',
        }}
      />
    </ErrorBoundary>
  </React.StrictMode>,
);

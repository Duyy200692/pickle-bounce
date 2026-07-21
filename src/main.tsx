import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global Fetch Interceptor for External Backend Connections (e.g. Vercel static deployments)
const originalFetch = window.fetch;
window.fetch = function(input, init) {
  let url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
  if (url.startsWith('/api/')) {
    const isVercel = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('pickle-bounce'));
    const customBackend = typeof window !== 'undefined' ? localStorage.getItem('alobo_backend_url') : null;
    const defaultBackend = 'https://ais-pre-m4i6tghifj35swvbdvdnxq-197039547577.asia-southeast1.run.app';
    const backendToUse = customBackend || (isVercel ? defaultBackend : null);
    if (backendToUse) {
      const baseUrl = backendToUse.replace(/\/$/, '');
      url = `${baseUrl}${url}`;
    }
  }
  
  if (typeof input === 'string') {
    return originalFetch(url, init);
  } else {
    // If it's a URL or Request object, we pass the updated string url along with original options
    return originalFetch(url, init || (input as any));
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

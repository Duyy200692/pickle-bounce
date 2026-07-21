import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global Fetch Interceptor for External Backend Connections (e.g. Vercel static deployments)
const originalFetch = window.fetch;
window.fetch = function(input, init) {
  let url = '';
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else if (input && typeof input === 'object' && 'url' in input) {
    url = (input as any).url || '';
  }

  if (url && url.startsWith('/api/')) {
    const isVercel = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('pickle-bounce'));
    const customBackend = typeof window !== 'undefined' ? localStorage.getItem('alobo_backend_url') : null;
    const defaultBackend = 'https://ais-pre-m4i6tghifj35swvbdvdnxq-197039547577.asia-southeast1.run.app';
    const backendToUse = customBackend || (isVercel ? defaultBackend : null);
    
    if (backendToUse) {
      const baseUrl = backendToUse.replace(/\/$/, '');
      const newUrl = `${baseUrl}${url}`;
      
      if (typeof input === 'string') {
        return originalFetch.call(window, newUrl, init);
      } else if (input instanceof URL) {
        return originalFetch.call(window, newUrl, init);
      } else if (input && typeof input === 'object') {
        try {
          // Safely construct a new Request with modified URL and original Request properties
          const requestInit: RequestInit = {
            method: (input as any).method,
            headers: (input as any).headers,
            mode: (input as any).mode,
            credentials: (input as any).credentials,
            cache: (input as any).cache,
            redirect: (input as any).redirect,
            referrer: (input as any).referrer,
            integrity: (input as any).integrity,
            keepalive: (input as any).keepalive,
            signal: (input as any).signal
          };
          // Body can only be passed if not GET/HEAD
          if ((input as any).method !== 'GET' && (input as any).method !== 'HEAD' && 'body' in input) {
            requestInit.body = (input as any).body;
          }
          const newRequest = new Request(newUrl, requestInit);
          return originalFetch.call(window, newRequest);
        } catch (e) {
          return originalFetch.call(window, newUrl, init);
        }
      }
    }
  }
  
  // Pass through absolutely untouched for everything else (crucial for Vite HMR/assets/etc.)
  return originalFetch.call(window, input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

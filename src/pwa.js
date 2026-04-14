// pwa.js — Add to your main.jsx or index.html
// Registers the service worker for PWA functionality

export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('Dialed SW registered:', reg.scope);
        })
        .catch((err) => {
          console.log('Dialed SW registration failed:', err);
        });
    });
  }
}

// Call this from main.jsx:
// import { registerSW } from './pwa';
// registerSW();

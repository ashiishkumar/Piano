import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { useStudioStore } from './store/useStudioStore';
import { db } from './db/database';

// Dev-only handles for the browser console and the smoke test (scripts/smoke.mjs).
// A bare import() from DevTools would get a second module instance once HMR has
// versioned the app's modules, so expose the live ones instead.
if (import.meta.env.DEV) {
  (window as unknown as { __studio: typeof useStudioStore; __db: typeof db }).__studio = useStudioStore;
  (window as unknown as { __studio: typeof useStudioStore; __db: typeof db }).__db = db;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

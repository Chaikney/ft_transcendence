import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';

if (import.meta.env.DEV) {
  import ('@/store').then(({ useMatchStore }) => {
    (window as any).__matchStore = useMatchStore.getState();
  });
}

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);

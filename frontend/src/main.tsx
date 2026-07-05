import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 1. Importamos tu búnker de seguridad principal
import App from './App'; 
import './index.css';

if (import.meta.env.DEV) {
  import ('@/store').then(({ useMatchStore }) => {
    (window as any).__matchStore = useMatchStore.getState();
  });
}

// 2. Conectamos App.tsx a la toma de corriente principal de React
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
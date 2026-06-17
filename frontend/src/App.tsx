import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from '@/store/authStore';

export default function App() {
  useEffect(() => {
    if (import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_MOCK === 'true') {
      console.log("Mock user loaded for development");
      useAuthStore.getState().setUser({ 
        id: 1, 
        username: 'mdiaz-or', 
        elo: 1247 
      });
    }
  }, []);

  return <RouterProvider router={router} />;
}
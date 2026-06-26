import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from '@/store/authStore';
import { ToastContainer } from '@/components/Toast';

export default function App() {
  useEffect(() => {
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      useAuthStore.getState().setUser({ 
        id: 1, 
        username: 'mdiaz-or', 
        elo: 1247 
      });
    }
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}
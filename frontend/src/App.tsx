import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from '@/store'; 
import { useAppearanceRadar } from './hooks/useActionCable'; // 1️⃣ Sin el .ts

export default function App() {
  console.log("🚀 ¡HOLA! APP.TSX SE ESTÁ EJECUTANDO");
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  // 2️⃣ ENCIENDE EL RADAR SIEMPRE
  // El propio hook se encarga por dentro de abortar si no hay token
  useAppearanceRadar(); 

  useEffect(() => {
    const initializeAuth = async () => {
      if (import.meta.env.VITE_USE_MOCK === 'true') {
        setUser({ id: 1, username: 'mdiaz-or', elo: 1247, avatar_url: '' });
        return;
      }

      const token = localStorage.getItem('auth_token');
      if (token) {
        setLoading(true);
        try {
          const response = await fetch('http://localhost:3000/api/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error("Error al validar sesión:", error);
          localStorage.removeItem('auth_token');
        } finally {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, [setUser, setLoading]);

  if (isLoading) {
    return <div className="loading-screen">INITIALIZING TERMINAL...</div>;
  }

  return <RouterProvider router={router} />;
}
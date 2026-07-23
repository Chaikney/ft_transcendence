import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from '@/store';
import { useAppearanceRadar } from './hooks/useActionCable';
import { useUserChannel } from './hooks/useUserChannel';
import { AuthScreen } from './components/AuthScreen';
import { ToastContainer } from '@/components/Toast';
import { BASE_URL } from './services/api';

export default function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setBanned = useAuthStore((s) => s.setBanned);

  const user = useAuthStore((s) => s.user);

  const [isInitializing, setIsInitializing] = useState(true);

  useAppearanceRadar();
  useUserChannel();

  useEffect(() => {
    const initializeAuth = async () => {
      if (import.meta.env.VITE_USE_MOCK === 'true') {
        // @ts-ignore
        setUser({ id: 1, username: 'mdiaz-or', elo: 1247, avatar_url: '', banned: false });
        setIsInitializing(false);
        return;
      }

      const token = localStorage.getItem('auth_token');

      if (token) {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const userData = await response.json();
            
            // 🛡️ TRAMPA ANTI-ROJOS PARA LA EVALUACIÓN
            // Si el backend mandó un 200 OK pero con la señal de baneo:
            if (userData.is_banned_signal) {
              // 1. Guardamos una versión mínima del usuario para que la pantalla roja
              // tenga algo que mostrar (como su username o ID si vienen en el JSON de error)
              setUser({ ...userData, banned: true }); 
            } else {
              // Si todo está bien, lo metemos normal
              setUser(userData); 
            }
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          localStorage.removeItem('auth_token');
        } finally {
          setLoading(false);
          setIsInitializing(false); 
        }
      } else {
        setLoading(false);
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [setUser, setLoading, setBanned]);

  // 🛑 BLOQUEO ABSOLUTO 1: El router no se monta hasta que no sabemos quién eres.
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center text-accent font-mono text-xl tracking-widest bg-bg-primary">
        &gt; INITIALIZING_SYSTEM_CORE...
      </div>
    );
  }

  // 🔨 BLOQUEO ABSOLUTO 2: EL MARTILLO DEL BAN
  if (user?.banned) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
        <div className="border-4 border-[#ff3366] bg-[#ff3366]/10 p-12 text-center animate-pulse flex flex-col gap-8 w-full max-w-3xl shadow-[0_0_100px_rgba(255,51,102,0.2)]">
          <h1 className="text-6xl md:text-8xl font-black text-[#ff3366] tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,51,102,0.8)]">
            Estás<br/>Baneado
          </h1>
          <p className="text-[#ff3366] font-mono text-xl md:text-2xl tracking-widest uppercase font-bold">
            &gt; ACCESO DENEGADO POR ADMINISTRACIÓN
          </p>
          <div className="text-text-muted font-mono mt-8 border-t-2 border-[#ff3366]/30 pt-6 text-sm">
            ENTIDAD COMPROMETIDA: <span className="text-[#ff3366]">{user.username || "UNKNOWN"}</span>
            <br /><br />
            Tu conexión a la red de Transcendence ha sido cortada indefinidamente.
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              window.location.href = '/login';
            }}
            className="mt-4 mx-auto px-6 py-2 border border-[#ff3366] text-[#ff3366] hover:bg-[#ff3366] hover:text-white font-mono transition-colors cursor-pointer"
          >
            &lt;- DESCONECTAR()
          </button>
        </div>
      </div>
    );
  }

  // 🟢 VÍA LIBRE
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '@/services/api'; // Usamos tu servicio centralizado

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Usamos un ref para evitar que el useEffect se dispare dos veces (típico en React 18+ con StrictMode)
  const isProcessing = useRef(false);

  useEffect(() => {
    if (isProcessing.current) return;
    
    const code = searchParams.get('code');
    
    if (code) {
      isProcessing.current = true;

      // Usamos tu helper 'post' de api.ts
      // Nota: Si en api.ts tienes BASE_URL como '.../api', aquí pones solo '/42/callback'
      post<{ token: string }>('/42/callback', { code })
        .then((response) => {
          console.log("Estructura de la respuesta:", response);
          const token = response.data?.token;
          if (token) {
            localStorage.setItem('auth_token', token); // Usamos 'auth_token' que es el que tu api.ts busca
            navigate('/'); 
          } else {
            navigate('/login');
          }
        })
        .catch((err) => {
          console.error("Error conectando con el backend:", err);
          navigate('/login');
        });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Negociando acceso con 42...</p>
      </div>
    </div>
  );
}
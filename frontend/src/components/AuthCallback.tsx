import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { post } from '@/services/api'; 
import { useAuthStore } from '@/store'; // 1. Importamos el store

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser); // 2. Traemos la acción para guardar al usuario
  
  const isProcessing = useRef(false);

  useEffect(() => {
    if (isProcessing.current) return;
    
    const code = searchParams.get('code');
    
    if (code) {
      isProcessing.current = true;

      post<any>('/42/callback', { code })
        .then((response) => {
          console.log("Estructura de la respuesta:", response);
          
          const token = response.data?.token;
          const user = response.data?.user; // 3. Sacamos el usuario de la respuesta de Rails

          if (token && user) {
            // Guardamos el token para sobrevivir al F5
            localStorage.setItem('auth_token', token); 
            
            // 🔥 LE DECIMOS A LA APP QUIÉN ES EL USUARIO (con su avatar incluido)
            setUser(user); 

            // Redirigimos a la home (o al perfil directamente si prefieres: `/profile/${user.username}`)
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
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white font-mono">
      <div className="flex flex-col items-center gap-4">
        {/* Un spinner un poco más acorde a tu estilo de terminal */}
        <div className="w-12 h-12 border-4 border-[#00ff88] border-t-transparent rounded-sm animate-spin"></div>
        <p className="tracking-widest text-[#00ff88] uppercase text-xs">&gt; NEGOTIATING ACCESS WITH 42_API...</p>
      </div>
    </div>
  );
}
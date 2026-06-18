import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Atrapamos el código que 42 nos ha puesto en la URL
    const code = searchParams.get('code');
    
    if (code) {
      // 2. Se lo enviamos al backend de Rails
      fetch('http://localhost:3000/api/auth/42/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          // 3. ¡Éxito! Guardamos el token y vamos al juego
          localStorage.setItem('jwt_token', data.token);
          navigate('/'); 
        } else {
          console.error("Fallo de autenticación", data);
          navigate('/login');
        }
      })
      .catch(err => {
        console.error("Error conectando con el backend", err);
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
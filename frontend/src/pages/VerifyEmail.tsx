import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/Toast';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  const hasCalled = useRef(false);
  useEffect(() => {
    if (hasCalled.current) return; // Si ya se ejecutó, no hagas nada
    hasCalled.current = true;
    const token = searchParams.get('token');

    if (!token) {
      setStatus('failed');
      error('No se encontró el token de verificación', 'Error Crítico');
      return;
    }

    // Llamamos al backend para validar el token
    fetch('http://localhost:3000/api/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          success(data.message, 'Identidad Confirmada');
          setTimeout(() => navigate('/login'), 3000); // Lo manda al login tras 3 segundos
        } else {
          setStatus('failed');
          error(data.error, 'Fallo de Sincronización');
        }
      })
      .catch(() => {
        setStatus('failed');
        error('Error de conexión con el servidor', 'System Offline');
      });
  }, [searchParams, navigate, success, error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base p-6">
      <div className="terminal-card bracket-corners p-8 max-w-md w-full flex flex-col items-center gap-6 text-center border-border-strong">
        
        {status === 'verifying' && (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-border-strong border-t-accent animate-spin" />
            <h1 className="text-xl font-mono font-bold text-text-primary tracking-tight uppercase">
              <span className="text-accent">&gt; </span>verifying_neural_link...
            </h1>
            <p className="text-xs font-mono text-text-muted">Conectando con la base de datos principal...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl">✔️</div>
            <h1 className="text-xl font-mono font-bold text-[#00ff88] tracking-tight uppercase">
              <span className="text-[#00ff88]">&gt; </span>identity_confirmed
            </h1>
            <p className="text-xs font-mono text-text-muted">El vacío te da la bienvenida. Redirigiendo al puerto de acceso...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="text-5xl">❌</div>
            <h1 className="text-xl font-mono font-bold text-[#ff3366] tracking-tight uppercase">
              <span className="text-[#ff3366]">&gt; </span>verification_failed
            </h1>
            <p className="text-xs font-mono text-text-muted">El token es inválido o ha caducado. Vuelve a registrarte.</p>
            <button 
              onClick={() => navigate('/login')} 
              className="mt-4 px-4 py-2 font-mono text-xs tracking-widest uppercase border border-[#ff3366] text-[#ff3366] hover:bg-[#ff3366]/10"
            >
              &gt; RETURN_TO_LOGIN
            </button>
          </>
        )}

      </div>
    </div>
  );
};
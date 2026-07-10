import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const ResetPasswordPage = () => {
  // Pillamos el token directamente de la URL
  const { token } = useParams<{ token: string }>(); 
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setIsError(true);
      setStatusMsg('ERR: PASSWORD_TOO_SHORT (MIN: 6)');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/password_resets/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });

      if (response.ok) {
        setIsError(false);
        setStatusMsg('✔️ SYSTEM SECURED: PASSWORD_UPDATED. Redirecting...');
        setTimeout(() => navigate('/login'), 2500); // 2.5 segundos para leer el mensaje y al login
      } else {
        const data = await response.json();
        setIsError(true);
        setStatusMsg(`❌ ERROR: ${data.error || 'INVALID_TOKEN'}`);
      }
    } catch (err) {
      setIsError(true);
      setStatusMsg('❌ CRITICAL: NETWORK_ERROR');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-[450px] terminal-card bracket-corners border border-border-strong bg-bg-elevated p-8">
        
        <header className="border-b border-border-strong pb-4 mb-6">
          <h1 className="text-2xl text-accent font-mono tracking-widest uppercase">&gt; NEW_CREDENTIALS</h1>
          <p className="text-text-muted text-xs font-mono mt-1">// OVERWRITE_PASSWORD_HASH</p>
        </header>

        <form onSubmit={handleReset} className="flex flex-col gap-4 font-mono">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-text-muted uppercase tracking-widest">
              NEW_PASSWORD:
            </label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-bg-base border border-border-strong p-3 text-xs text-text-primary focus:border-accent outline-none w-full"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="mt-4 px-4 py-3 font-mono text-xs tracking-widest uppercase border border-accent-border text-accent bg-accent-bg hover:bg-accent hover:text-bg-base transition-all duration-base cursor-pointer"
          >
            &gt; execute_update()
          </button>

          {statusMsg && (
            <div className={`mt-4 p-3 border text-xs tracking-wide ${
              isError 
                ? 'border-[#ff3366] text-[#ff3366] bg-[#ff3366]/10' 
                : 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10'
            }`}>
              {statusMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
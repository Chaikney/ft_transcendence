import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../services/api';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setIsError(true);
      setStatusMsg('ERR: MISSING_EMAIL_PARAMETER');
      return;
    }

    try {
        const response = await fetch(`${BASE_URL}/password_resets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setIsError(false);
        setStatusMsg('✔️ SYSTEM MSG: Si el correo existe, recibirás las instrucciones en breve.');
        setEmail(''); // Limpiamos el input
      } else {
        setIsError(true);
        setStatusMsg('❌ ERROR: No se pudo procesar la solicitud.');
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
          <h1 className="text-2xl text-accent font-mono tracking-widest uppercase">&gt; RECOVER_ACCESS</h1>
          <p className="text-text-muted text-xs font-mono mt-1">// ENTER_LINKED_EMAIL</p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-mono">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-text-muted uppercase tracking-widest">
              USER_EMAIL:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-bg-base border border-border-strong p-3 text-xs text-text-primary focus:border-accent outline-none w-full"
              placeholder="user@42urduliz.com"
            />
          </div>

          <button
            type="submit"
            className="mt-2 px-4 py-3 font-mono text-xs tracking-widest uppercase border border-accent-border text-accent bg-accent-bg hover:bg-accent hover:text-bg-base transition-all duration-base cursor-pointer"
          >
            &gt; send_recovery_link()
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="px-4 py-2 font-mono text-xs tracking-widest uppercase border border-border-strong text-text-muted hover:border-accent hover:text-accent transition-all duration-base cursor-pointer"
          >
            &lt;- abort_and_return()
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

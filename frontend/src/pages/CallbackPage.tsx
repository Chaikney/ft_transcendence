import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { post } from '@/services/api';
import type { User } from '@/types';
import { useToast } from '@/components/Toast';
import { InlineLoader } from '@/components'; // O asegúrate de que la ruta sea correcta

interface TokenResponse {
  token: string;
  user: User;
}

const styles = {
  page: 'min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-bg-base',
  errorWrap: 'flex flex-col gap-4 items-center max-w-md w-full',
  errorMsg: 'text-sm font-mono text-[#ff3366] p-4 border border-[#ff3366]/30 bg-[#ff3366]/05 text-center',
  retryBtn: 'px-6 py-2 font-mono text-xs tracking-widest uppercase border border-border-strong text-text-muted cursor-pointer hover:border-accent-border hover:text-text-secondary transition-all',
} as const;

export const CallbackPage = () => {
  const navigate = useNavigate();
  const setUser  = useAuthStore((s) => s.setUser);
  const { error } = useToast();

  const [authError, setAuthError] = useState<string | null>(null);
  
  // Prevent double-execution in StrictMode
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const exchange = async () => {
      try {
        // Step 1 — extract code from URL
        const params = new URLSearchParams(window.location.search);
        const code   = params.get('code');

        if (!code) throw new Error('No authorization code in URL.');

        // Step 2 — exchange code for token
        const res = await post<TokenResponse, { code: string }>(
          '/42/callback',
          { code }
        );
        localStorage.setItem('auth_token', res.data.token);

        // Step 3 — store user
        setUser(res.data.user);

        // Done - Redirect immediately
        navigate('/');

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error.';
        error(msg, 'Auth Failed');
        setAuthError(msg);
      }
    };

    exchange();
  }, [navigate, setUser, error]);

  // Si hay error, mostramos un bloque muy sencillo para reintentar
  if (authError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorWrap}>
          <div className={styles.errorMsg}>
            &gt; Authentication failed: {authError}
          </div>
          <button
            className={styles.retryBtn}
            onClick={() => navigate('/login')}
          >
            &gt; retry_login()
          </button>
        </div>
      </div>
    );
  }

  // Mientras se hace el login en background, enseñamos un loader limpio y seguro
  return (
    <div className={styles.page}>
      <InlineLoader label="Authenticating with 42 Network..." />
    </div>
  );
};
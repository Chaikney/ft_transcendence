import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';

// ── Styles ────────────────────────────────────────────────────────────────
const styles = {
  wrap:
    'min-h-screen flex items-center justify-center',
  card:
    'terminal-card bracket-corners p-5 ' +
    'flex flex-col gap-3 w-full max-w-xs',
  header:
    'flex items-center gap-2 pb-2 border-b border-border-strong',
  dot:
    'w-2 h-2 rounded-full',
  title:
    'text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted',
  logRow:
    'flex items-center gap-2 text-[10px] font-mono',
  spinner:
    'w-3 h-3 rounded-full border border-border-strong border-t-accent ' +
    'animate-spin-slow shrink-0',
  logText:
    'text-text-secondary',
  cursor:
    'w-2 h-3 bg-accent animate-blink inline-block',
} as const;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading       = useAuthStore((s) => s.isLoading);
  const isMock          = import.meta.env.VITE_USE_MOCK === 'true';
  const location        = useLocation();

  // Small delay to avoid flash on fast auth checks
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setChecked(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Mock mode — always allow
  if (isMock) return <>{children}</>;

  // Still loading auth state
  if (isLoading || !checked) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.dot} style={{ background: '#ffaa00' }} />
            <span className={styles.title}>auth_guard — checking session</span>
          </div>
          <div className={styles.logRow}>
            <span className={styles.spinner} />
            <span className={styles.logText}>
              &gt; verifying credentials...
            </span>
          </div>
          <span className={styles.cursor} />
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login, preserve intended destination
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Authenticated — render children
  return <>{children}</>;
};
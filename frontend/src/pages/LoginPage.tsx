import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { useToast } from '@/components/Toast';

// ── 42 OAuth URL ───────────────────────────────────────────────────────────
const OAUTH_URL = `https://api.intra.42.fr/oauth/authorize?client_id=${
  import.meta.env.VITE_42_CLIENT_ID ?? 'YOUR_CLIENT_ID'
}&redirect_uri=${
  encodeURIComponent(import.meta.env.VITE_42_REDIRECT_URI ?? 'http://localhost:5173/auth/callback')
}&response_type=code`;

// ── Styles ────────────────────────────────────────────────────────────────
const styles = {
  page:
    'min-h-screen flex flex-col items-center justify-center ' +
    'px-6 py-16 gap-8',

  // Main card
  card:
    'w-full max-w-md terminal-card bracket-corners p-6 ' +
    'flex flex-col gap-6',

  // Card header
  cardHeader:
    'flex items-center gap-2 pb-3 border-b border-border-strong',
  headerDot:
    'w-2 h-2 rounded-full',
  headerTitle:
    'text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted flex-1',
  headerStatus:
    'text-[10px] font-mono tracking-widest text-[#ffaa00]',

  // Title
  titleWrap:
    'flex flex-col gap-1',
  titleEye:
    'text-[10px] font-mono text-text-muted tracking-widest uppercase',
  title:
    'text-2xl font-mono font-bold text-text-primary tracking-tight',
  titleAccent:
    'text-accent',
  subtitle:
    'text-xs font-mono text-text-muted leading-relaxed',

  // Info block
  infoBlock:
    'flex flex-col gap-2 p-3 border border-border-strong ' +
    'bg-bg-elevated',
  infoLine:
    'flex items-center gap-2 text-[10px] font-mono',
  infoKey:
    'text-text-muted w-28 shrink-0',
  infoVal:
    'text-accent',

  // OAuth button
  oauthBtn:
    'w-full flex items-center justify-center gap-3 ' +
    'py-3 px-4 font-mono font-bold text-sm tracking-widest uppercase ' +
    'border-2 border-accent text-accent ' +
    'bg-accent-bg ' +
    'transition-all duration-base cursor-pointer ' +
    'hover:bg-accent hover:text-bg-base ' +
    'hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] ' +
    'active:scale-[0.98] ' +
    'disabled:opacity-30 disabled:cursor-not-allowed',
  oauthIcon:
    'text-lg font-bold',

  // Mock login button
  mockBtn:
    'w-full flex items-center justify-center gap-2 ' +
    'py-2 px-4 font-mono text-xs tracking-widest uppercase ' +
    'border border-border-strong text-text-muted ' +
    'transition-all duration-base cursor-pointer ' +
    'hover:border-accent-border hover:text-text-secondary',

  // Footer note
  footerNote:
    'text-[10px] font-mono text-text-muted text-center leading-relaxed',
  footerLink:
    'text-accent cursor-pointer hover:text-accent-hover',

  // Loading state
  loadingWrap:
    'flex flex-col items-center gap-3 py-4',
  loadingSpinner:
    'w-6 h-6 rounded-full border-2 border-border-strong border-t-accent animate-spin-slow',
  loadingText:
    'text-xs font-mono text-text-muted tracking-widest animate-pulse',
} as const;

// ── Component ──────────────────────────────────────────────────────────────
export const LoginPage = () => {
  const navigate   = useNavigate();
  const setUser    = useAuthStore((s) => s.setUser);
  const isMock     = import.meta.env.VITE_USE_MOCK === 'true';
  const [loading, setLoading] = useState(false);

  const { info, success } = useToast();

  // Real OAuth — redirect to 42
  const handleOAuth = () => {
    setLoading(true);
    info('Redirecting to 42...', 'Authentication');
    window.location.href = OAUTH_URL;
  };

  // Mock login — bypass OAuth in dev
  const handleMockLogin = () => {
    success('Sesión de desarrollo iniciada', 'Mock Login');
    setUser({ id: 1, username: 'mdiaz-or', elo: 1247 });
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Header */}
        <div className={styles.cardHeader}>
          <span className={styles.headerDot} style={{ background: '#ff3366' }} />
          <span className={styles.headerDot} style={{ background: '#ffaa00' }} />
          <span className={styles.headerDot} style={{ background: '#00ff88' }} />
          <span className={styles.headerTitle}>auth_module.ts — login</span>
          <span className={styles.headerStatus}>AWAITING_INPUT</span>
        </div>

        {/* Title */}
        <div className={styles.titleWrap}>
          <span className={styles.titleEye}>// authentication required</span>
          <h1 className={styles.title}>
            <span className={styles.titleAccent}>&gt; </span>
            connect_42()
          </h1>
          <p className={styles.subtitle}>
            Authenticate with your 42 Network account to access the platform.
          </p>
        </div>

        {/* Info */}
        <div className={styles.infoBlock}>
          {[
            ['protocol',   'OAuth 2.0'],
            ['provider',   '42 Network'],
            ['scope',      'public profile'],
            ['redirect',   '/callback'],
          ].map(([k, v]) => (
            <div key={k} className={styles.infoLine}>
              <span className={styles.infoKey}>&gt; {k}:</span>
              <span className={styles.infoVal}>{v}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.loadingSpinner} />
            <span className={styles.loadingText}>
              redirecting to 42 oauth...
            </span>
          </div>
        ) : (
          <>
            <button
              className={styles.oauthBtn}
              onClick={handleOAuth}
              disabled={loading}
            >
              <span className={styles.oauthIcon}>42</span>
              authenticate_with_42
            </button>

            {isMock && (
              <button
                className={styles.mockBtn}
                onClick={handleMockLogin}
              >
                &gt; [DEV] mock_login() — skip oauth
              </button>
            )}
          </>
        )}

        {/* Footer */}
        <p className={styles.footerNote}>
          // by authenticating you agree to the{' '}
          <span className={styles.footerLink}>terms_of_service</span>
          {' '}and{' '}
          <span className={styles.footerLink}>privacy_policy</span>
        </p>

      </div>
    </div>
  );
};

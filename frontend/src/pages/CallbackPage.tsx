import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { post } from '@/services/api';
import type { User } from '@/types';
import { useToast } from '@/components/Toast';

type CallbackStatus =
  | 'extracting'
  | 'exchanging'
  | 'fetching'
  | 'success'
  | 'error';

  interface TokenResponse {
    token: string;
    user: User;
  }

const STATUS_LOGS: Record<CallbackStatus, string> = {
  extracting: '> Extracting authorization code...',
  exchanging: '> Exchanging code for token.......',
  fetching:   '> Fetching user profile...........',
  success:    '> Authentication successful.......',
  error:      '> Authentication failed............',
};

const styles = {
  page:
    'min-h-screen flex flex-col items-center justify-center ' +
    'px-6 py-16 gap-6',

  card:
    'w-full max-w-md terminal-card bracket-corners p-6 ' +
    'flex flex-col gap-5',

  cardHeader:
    'flex items-center gap-2 pb-3 border-b border-border-strong',
  headerDot:
    'w-2 h-2 rounded-full',
  headerTitle:
    'text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted flex-1',

  titleWrap:
    'flex flex-col gap-1',
  titleEye:
    'text-[10px] font-mono text-text-muted tracking-widest uppercase',
  title:
    'text-xl font-mono font-bold text-text-primary tracking-tight',
  titleAccent:
    'text-accent',

  // Log terminal
  logWrap:
    'flex flex-col gap-1.5 p-3 border border-border bg-bg-base ' +
    'font-mono text-xs min-h-[120px]',
  logLine:
    'flex items-center gap-2',
  logText:
    'text-text-secondary',
  logOk:
    'text-[#00ff88] text-[10px] font-bold shrink-0',
  logPending:
    'text-[#ffaa00] text-[10px] font-bold shrink-0',
  logError:
    'text-[#ff3366] text-[10px] font-bold shrink-0',
  logSpinner:
    'w-3 h-3 rounded-full border border-border-strong border-t-accent ' +
    'animate-spin-slow shrink-0',
  logCursor:
    'w-2 h-3 bg-accent animate-blink shrink-0',

  // Success state
  successWrap:
    'flex flex-col gap-2 p-3 border border-[#00ff88]/30 bg-[#00ff88]/05',
  successLine:
    'flex items-center gap-2 text-xs font-mono',
  successKey:
    'text-text-muted w-20 shrink-0',
  successVal:
    'text-[#00ff88]',

  // Error state
  errorWrap:
    'flex flex-col gap-3',
  errorMsg:
    'text-xs font-mono text-[#ff3366] p-3 border border-[#ff3366]/30 ' +
    'bg-[#ff3366]/05 leading-relaxed',
  retryBtn:
    'w-full py-2 font-mono text-xs tracking-widest uppercase border ' +
    'border-border-strong text-text-muted cursor-pointer ' +
    'hover:border-accent-border hover:text-text-secondary ' +
    'transition-all duration-base',
} as const;

// Completed steps tracker ────────────────────────────────────────────────
type Step = 'extracting' | 'exchanging' | 'fetching';
const STEPS: Step[] = ['extracting', 'exchanging', 'fetching'];

// Component ──────────────────────────────────────────────────────────────
export const CallbackPage = () => {
  const navigate = useNavigate();
  const setUser  = useAuthStore((s) => s.setUser);
  const { error, success } = useToast();

  const [status,    setStatus]    = useState<CallbackStatus>('extracting');
  const [authError,     setAuthError]     = useState<string | null>(null);
  const [user,      setLocalUser] = useState<User | null>(null);
  const [completed, setCompleted] = useState<Set<Step>>(new Set());

  // Prevent double-execution in StrictMode
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const exchange = async () => {
      try {
        // Step 1 — extract code from URL
        setStatus('extracting');
        const params = new URLSearchParams(window.location.search);
        const code   = params.get('code');

        if (!code) throw new Error('No authorization code in URL.');
        setCompleted((c) => new Set(c).add('extracting'));

        // Step 2 — exchange code for token
        setStatus('exchanging');
        const res = await post<TokenResponse, { code: string }>(
          '/auth/callback',
          { code }
        );
        localStorage.setItem('auth_token', res.data.token);
        setCompleted((c) => new Set(c).add('exchanging'));

        // Step 3 — store user
        setStatus('fetching');
        setLocalUser(res.data.user);
        setUser(res.data.user);
        setCompleted((c) => new Set(c).add('fetching'));

        // Done
        setStatus('success');
        setTimeout(() => navigate('/'), 1500);

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error.';
        
        error(msg, 'Auth Failed');
        setAuthError(msg);
        setStatus('error');
      }
    };

    exchange();
  }, []);

  const getStepState = (step: Step) => {
    if (completed.has(step))        return 'ok';
    if (STATUS_LOGS[status] === STATUS_LOGS[step]) return 'pending';
    return 'waiting';
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Header */}
        <div className={styles.cardHeader}>
          <span className={styles.headerDot} style={{ background: '#ff3366' }} />
          <span className={styles.headerDot} style={{ background: '#ffaa00' }} />
          <span className={styles.headerDot} style={{ background: '#00ff88' }} />
          <span className={styles.headerTitle}>
            auth_module.ts — oauth callback
          </span>
        </div>

        {/* Title */}
        <div className={styles.titleWrap}>
          <span className={styles.titleEye}>// processing oauth response</span>
          <h1 className={styles.title}>
            <span className={styles.titleAccent}>&gt; </span>
            exchange_token()
          </h1>
        </div>

        {/* Log terminal */}
        <div className={styles.logWrap}>
          {STEPS.map((step) => {
            const state = getStepState(step);
            return (
              <div key={step} className={styles.logLine}>
                {state === 'ok'      && <span className={styles.logOk}>OK</span>}
                {state === 'pending' && <span className={styles.logSpinner} />}
                {state === 'waiting' && <span className={styles.logCursor} style={{ opacity: 0.2 }} />}
                <span
                  className={styles.logText}
                  style={{
                    color: state === 'ok'
                      ? '#4a9eca'
                      : state === 'pending'
                      ? '#c8e8ff'
                      : '#1e4d6b',
                  }}
                >
                  {STATUS_LOGS[step]}
                </span>
              </div>
            );
          })}

          {status === 'error' && (
            <div className={styles.logLine}>
              <span className={styles.logError}>ERR</span>
              <span className={styles.logText} style={{ color: '#ff3366' }}>
                {STATUS_LOGS.error}
              </span>
            </div>
          )}

          {status === 'success' && (
            <div className={styles.logLine}>
              <span className={styles.logOk}>OK</span>
              <span className={styles.logText} style={{ color: '#00ff88' }}>
                &gt; Redirecting to dashboard...
              </span>
            </div>
          )}

          {status !== 'success' && status !== 'error' && (
            <span className={styles.logCursor} style={{ marginTop: 4 }} />
          )}
        </div>

        {/* Success info */}
        {status === 'success' && user && (
          <div className={styles.successWrap}>
            {[
              ['user',     user.username],
              ['elo',      String(user.elo)],
              ['status',   'AUTHENTICATED'],
            ].map(([k, v]) => (
              <div key={k} className={styles.successLine}>
                <span className={styles.successKey}>&gt; {k}:</span>
                <span className={styles.successVal}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className={styles.errorWrap}>
            <div className={styles.errorMsg}>
            </div>
            <button
              className={styles.retryBtn}
              onClick={() => navigate('/login')}
            >
              &gt; retry_login()
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
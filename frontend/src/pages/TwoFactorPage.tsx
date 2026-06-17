import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, post, del } from '@/services/api';
import { TerminalCard } from '@/components/TerminalCard';
import { TerminalInput } from '@/components/TerminalInput';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { useToast } from '@/components/Toast';
import { useAuthStore } from '@/store';

// ── Types ──────────────────────────────────────────────────────────────────
interface GenerateResponse {
  qr_code: string; // raw SVG string from backend
}

interface VerifyResponse {
  success: boolean;
  message: string;
}

type TwoFAStep =
  | 'status'    // initial — shows current 2FA state
  | 'setup'     // QR code displayed, waiting for first verify
  | 'verify'    // code input after QR scan
  | 'disable';  // confirm disable flow

// ── Styles ────────────────────────────────────────────────────────────────
const s = {
  page:
    'min-h-screen flex flex-col items-center px-6 py-12 gap-8',

  header:
    'w-full max-w-lg flex flex-col gap-2',
  eyebrow:
    'text-[10px] font-mono tracking-[0.3em] uppercase text-text-muted',
  title:
    'text-2xl font-mono font-bold text-text-primary tracking-tight',
  titleAccent:
    'text-accent',
  subtitle:
    'text-xs font-mono text-text-muted leading-relaxed',

  // Info rows
  infoBlock:
    'flex flex-col gap-2 p-3 border border-border-strong bg-bg-elevated',
  infoRow:
    'flex items-center gap-2 text-[10px] font-mono',
  infoKey:
    'text-text-muted w-32 shrink-0',
  infoVal:
    'text-accent',

  // QR code container
  qrWrapper:
    'flex flex-col items-center gap-3 p-4 border border-border bg-white',
  qrHint:
    'text-[10px] font-mono text-text-muted text-center',

  // Step indicators
  stepRow:
    'flex items-center gap-3',
  stepDot:
    'w-2 h-2 rounded-full flex-shrink-0',
  stepText:
    'text-[10px] font-mono text-text-muted',

  // Status card
  statusRow:
    'flex items-center justify-between',
  statusLabel:
    'text-xs font-mono text-text-secondary',

  // Danger zone
  dangerZone:
    'flex flex-col gap-3 p-3 border border-status-error/30 bg-status-error-bg',
  dangerTitle:
    'text-[10px] font-mono tracking-widest uppercase text-status-error',
  dangerText:
    'text-[10px] font-mono text-text-muted leading-relaxed',

  // Error / success
  errorMsg:
    'text-[10px] font-mono text-status-error p-3 ' +
    'border border-status-error/30 bg-status-error-bg',
  successMsg:
    'text-[10px] font-mono text-status-success p-3 ' +
    'border border-status-success/30 bg-status-success-bg',

  // Loading
  loadingWrap:
    'flex flex-col items-center gap-3 py-6',
  spinner:
    'w-6 h-6 rounded-full border-2 border-border-strong ' +
    'border-t-accent animate-spin-slow',
  loadingText:
    'text-xs font-mono text-text-muted tracking-widest animate-pulse',

  actionRow:
    'flex items-center gap-3 flex-wrap',
} as const;

// ── Component ──────────────────────────────────────────────────────────────
export const TwoFactorPage = () => {
  const navigate      = useNavigate();
  const currentUser   = useAuthStore((s) => s.user);
  const { success, error: toastError } = useToast();
  const isMock        = import.meta.env.VITE_USE_MOCK === 'true';

  const [step,       setStep]       = useState<TwoFAStep>('status');
  const [is2FAEnabled, set2FAEnabled] = useState(false);
  const [qrSvg,      setQrSvg]      = useState<string | null>(null);
  const [code,       setCode]        = useState('');
  const [loading,    setLoading]     = useState(false);
  const [error,      setError]       = useState<string | null>(null);

  // ── Mock 2FA state ────────────────────────────────────────────────────
  useEffect(() => {
    if (isMock) {
      set2FAEnabled(false);
    }
    // Real: could GET /api/users/:id and check 2fa_enabled field
  }, []);

  // ── Step 1: GET /api/2fa/generate ────────────────────────────────────
  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 600));
        // Mock QR SVG — a simple placeholder
        setQrSvg(`
          <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
            <rect width="180" height="180" fill="white"/>
            <rect x="10" y="10" width="60" height="60" fill="none" stroke="black" stroke-width="4"/>
            <rect x="20" y="20" width="40" height="40" fill="black"/>
            <rect x="110" y="10" width="60" height="60" fill="none" stroke="black" stroke-width="4"/>
            <rect x="120" y="20" width="40" height="40" fill="black"/>
            <rect x="10" y="110" width="60" height="60" fill="none" stroke="black" stroke-width="4"/>
            <rect x="20" y="120" width="40" height="40" fill="black"/>
            <rect x="80" y="80" width="20" height="20" fill="black"/>
            <rect x="110" y="80" width="10" height="10" fill="black"/>
            <rect x="130" y="80" width="10" height="10" fill="black"/>
            <rect x="80" y="110" width="10" height="10" fill="black"/>
            <rect x="100" y="120" width="20" height="10" fill="black"/>
            <rect x="140" y="120" width="20" height="10" fill="black"/>
            <text x="90" y="170" text-anchor="middle" font-size="8" fill="#666">MOCK QR CODE</text>
          </svg>
        `);
        setStep('setup');
        setLoading(false);
        return;
      }

      const res = await get<GenerateResponse>('/2fa/generate');
      setQrSvg(res.data.qr_code);
      setStep('setup');

    } catch {
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: POST /api/2fa/verify ─────────────────────────────────────
  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 400));
        // Mock: accept any 6-digit code
        set2FAEnabled(true);
        setStep('status');
        setCode('');
        setQrSvg(null);
        success('2FA enabled successfully', '2FA');
        setLoading(false);
        return;
      }

      const res = await post<VerifyResponse, { code: string }>(
        '/2fa/verify',
        { code }
      );

      if (res.data.success) {
        set2FAEnabled(true);
        setStep('status');
        setCode('');
        setQrSvg(null);
        success('Two-factor authentication enabled.', '2FA');
      } else {
        setError(res.data.message ?? 'Invalid code. Please try again.');
      }

    } catch {
      setError('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: DELETE /api/2fa/disable ──────────────────────────────────
  const handleDisable = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 400));
        set2FAEnabled(false);
        setStep('status');
        success('2FA disabled.', '2FA');
        setLoading(false);
        return;
      }

      await del('/2fa/disable');
      set2FAEnabled(false);
      setStep('status');
      success('Two-factor authentication disabled.', '2FA');

    } catch {
      setError('Failed to disable 2FA. Please try again.');
      toastError('Failed to disable 2FA.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={s.page}>

      {/* Header */}
      <div className={s.header}>
        <span className={s.eyebrow}>// security.two_factor_auth</span>
        <h1 className={s.title}>
          <span className={s.titleAccent}>&gt; </span>
          Two-Factor Authentication
        </h1>
        <p className={s.subtitle}>
          // TOTP-based 2FA using an authenticator app (Google Authenticator,
          Authy, etc.)
        </p>
      </div>

      <TerminalCard
        title="2fa_module — settings"
        status={is2FAEnabled ? 'ENABLED' : 'DISABLED'}
        statusVariant={is2FAEnabled ? 'active' : 'error'}
        maxWidth="max-w-lg"
        padding="p-5"
      >
        <div className="flex flex-col gap-5">

          {/* Current status */}
          <div className={s.statusRow}>
            <span className={s.statusLabel}>
              &gt; current_status:
            </span>
            <Badge
              variant={is2FAEnabled ? 'success' : 'error'}
              dot
            >
              {is2FAEnabled ? '2FA enabled' : '2FA disabled'}
            </Badge>
          </div>

          {/* Info block */}
          <div className={s.infoBlock}>
            {[
              ['method',    'TOTP (RFC 6238)'],
              ['algorithm', 'SHA-1 / 30s window'],
              ['endpoint',  'POST /api/2fa/verify'],
              ['user',      currentUser?.username ?? '—'],
            ].map(([k, v]) => (
              <div key={k} className={s.infoRow}>
                <span className={s.infoKey}>&gt; {k}:</span>
                <span className={s.infoVal}>{v}</span>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className={s.errorMsg}>// error: {error}</div>
          )}

          {/* Loading */}
          {loading && (
            <div className={s.loadingWrap}>
              <div className={s.spinner} />
              <span className={s.loadingText}>processing...</span>
            </div>
          )}

          {/* ── STATUS step — entry point ── */}
          {step === 'status' && !loading && (
            <>
              {!is2FAEnabled ? (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-mono text-text-muted leading-relaxed">
                    // 2FA adds a second layer of security. After enabling,
                    you will need your authenticator app every time you log in.
                  </p>

                  {/* Setup steps */}
                  {[
                    'Scan the QR code with your authenticator app',
                    'Enter the 6-digit code to confirm setup',
                    '2FA will be required on every login',
                  ].map((text, i) => (
                    <div key={i} className={s.stepRow}>
                      <span
                        className={s.stepDot}
                        style={{ background: '#00d4ff' }}
                      />
                      <span className={s.stepText}>{text}</span>
                    </div>
                  ))}

                  <Button
                    variant="primary"
                    onClick={handleGenerate}
                  >
                    &gt; enable_2fa()
                  </Button>
                </div>
              ) : (
                <div className={s.dangerZone}>
                  <span className={s.dangerTitle}>// danger zone</span>
                  <p className={s.dangerText}>
                    Disabling 2FA will remove the second authentication
                    factor from your account. Your account will only be
                    protected by your password.
                  </p>
                  <Button
                    variant="danger"
                    onClick={() => setStep('disable')}
                  >
                    &gt; disable_2fa()
                  </Button>
                </div>
              )}
            </>
          )}

          {/* ── SETUP step — show QR code ── */}
          {step === 'setup' && !loading && qrSvg && (
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-mono text-text-muted">
                // scan this QR code with your authenticator app, then
                enter the 6-digit code below to activate 2FA.
              </p>

              {/* QR code — rendered as raw SVG from backend */}
              <div className={s.qrWrapper}>
                <div
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                  style={{ lineHeight: 0 }}
                  aria-label="2FA QR Code"
                />
                <span className={s.qrHint}>
                  // scan with Google Authenticator or Authy
                </span>
              </div>

              <Button
                variant="secondary"
                onClick={() => setStep('verify')}
              >
                &gt; i_scanned_it()
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStep('status'); setQrSvg(null); }}
              >
                &gt; cancel()
              </Button>
            </div>
          )}

          {/* ── VERIFY step — enter code ── */}
          {step === 'verify' && !loading && (
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-mono text-text-muted">
                // open your authenticator app and enter the current
                6-digit code for ft_transcendence.
              </p>

              <TerminalInput
                label="authenticator code"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                hint="enter the 6-digit code from your app"
                error={
                  code.length > 0 && code.length < 6
                    ? 'code must be 6 digits'
                    : undefined
                }
              />

              <div className={s.actionRow}>
                <Button
                  variant="primary"
                  onClick={handleVerify}
                  disabled={code.length !== 6}
                >
                  &gt; verify_and_activate()
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('setup')}
                >
                  &gt; back()
                </Button>
              </div>
            </div>
          )}

          {/* ── DISABLE step — confirm disable ── */}
          {step === 'disable' && !loading && (
            <div className="flex flex-col gap-4">
              <div className={s.dangerZone}>
                <span className={s.dangerTitle}>// confirm disable</span>
                <p className={s.dangerText}>
                  Are you sure you want to disable two-factor
                  authentication? This will make your account less secure.
                </p>
              </div>

              <div className={s.actionRow}>
                <Button
                  variant="danger"
                  onClick={handleDisable}
                >
                  &gt; confirm_disable()
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStep('status'); setError(null); }}
                >
                  &gt; cancel()
                </Button>
              </div>
            </div>
          )}

        </div>
      </TerminalCard>

      {/* Back to profile */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          navigate(
            currentUser ? `/profile/${currentUser.username}` : '/'
          )
        }
      >
        &gt; back_to_profile()
      </Button>

    </div>
  );
};
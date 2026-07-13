import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { registerGuest, loginGuest } from '@/services/auth';
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
  page: 'min-h-screen flex flex-col items-center justify-center px-6 py-16 gap-8',
  card: 'w-full max-w-md terminal-card bracket-corners p-6 flex flex-col gap-6 relative',
  cardHeader: 'flex items-center gap-2 pb-3 border-b border-border-strong',
  headerDot: 'w-2 h-2 rounded-full',
  headerTitle: 'text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted flex-1',
  headerStatus: 'text-[10px] font-mono tracking-widest',
  
  titleWrap: 'flex flex-col gap-1',
  titleEye: 'text-[10px] font-mono text-text-muted tracking-widest uppercase',
  title: 'text-2xl font-mono font-bold text-text-primary tracking-tight',
  titleAccent: 'text-accent',
  subtitle: 'text-xs font-mono text-text-muted leading-relaxed',

  infoBlock: 'flex flex-col gap-2 p-3 border border-border-strong bg-bg-elevated',
  infoLine: 'flex items-center gap-2 text-[10px] font-mono',
  infoKey: 'text-text-muted w-28 shrink-0',
  infoVal: 'text-accent',

  primaryBtn: 'w-full flex items-center justify-center gap-3 py-3 px-4 font-mono font-bold text-sm tracking-widest uppercase border-2 border-accent text-accent bg-accent-bg transition-all duration-base cursor-pointer hover:bg-accent hover:text-bg-base hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed',
  secondaryBtn: 'w-full flex items-center justify-center gap-2 py-2 px-4 font-mono text-xs tracking-widest uppercase border border-border-strong text-text-muted transition-all duration-base cursor-pointer hover:border-accent-border hover:text-text-secondary',

  input: 'w-full bg-transparent border-b border-border-strong text-text-primary font-mono py-2 focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted/30 text-sm',
  
  footerNote: 'text-[10px] font-mono text-text-muted text-center leading-relaxed mt-4',
  footerLink: 'text-accent cursor-pointer hover:text-accent-hover',

  loadingWrap: 'flex flex-col items-center gap-3 py-4',
  loadingSpinner: 'w-6 h-6 rounded-full border-2 border-border-strong border-t-accent animate-spin-slow',
  loadingText: 'text-xs font-mono text-text-muted tracking-widest animate-pulse',
} as const;

type AuthMode = 'main' | 'guest_login' | 'guest_register' | '2fa_setup' | '2fa_verify' | 'email_verify';

// ── Component ──────────────────────────────────────────────────────────────
export const LoginPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const { info, success, error: showError } = useToast();

  const [mode, setMode] = useState<AuthMode>('main');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [otpSecret, setOtpSecret] = useState<string | null>(null);

  // 🇩🇪 La barrera de seguridad visual
  const isPasswordValid = password.length >= 6;

  const handleOAuth = () => {
    setLoading(true);
    info('Redirecting to 42...', 'Authentication');
    window.location.href = OAUTH_URL;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return; // Bloqueo si le dan al Enter saltándose el botón

    setLoading(true);
    setErrorMessage(null);
    try {
      const res: any = await registerGuest({ username, email, password });
      
      // 🥷 LA TRAMPA NINJA: Si el backend nos avisa de un error de forma suave
      if (res && res.ok === false) {
        setErrorMessage(res.error || 'Error en el registro');
        showError(res.error || 'Error en el registro', 'System Error');
        return; // Cortamos la ejecución aquí
      }
      
      // Si todo ha ido bien, pasamos a la pantalla de email.
      setMode('email_verify');
      success('Identity compiled. Check your inbox.', 'Verification Required');
    } catch (err: any) {
      // Aquí solo caerá si el servidor está apagado o se corta internet
      setErrorMessage(err.message || 'Error crítico en el servidor');
      showError(err.message || 'Error crítico en el servidor', 'System Error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const res: any = await loginGuest({ username, password, totp_code: totpCode });
      
      // 🥷 LA TRAMPA NINJA 2: Hacemos lo mismo para el login
      if (res && res.ok === false) {
        const msg = res.error || 'Error en el acceso';
        
        // Comprobamos si el error es de 2FA o de email sin verificar
        if (msg.includes('Código') || msg.includes('2FA')) {
          setMode('2fa_verify');
          info('Se requiere código de seguridad', '2FA Detectado');
        } else {
          setErrorMessage(msg);
          showError(msg, 'Access Denied');
        }
        return; // Cortamos la ejecución aquí
      }

      // Si todo ha ido bien
      if (res.token) {
        localStorage.setItem('auth_token', res.token);
        setUser(res.user);
        success('Acceso concedido.', 'Login Exitoso');
        navigate('/');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error crítico en el servidor');
      showError(err.message || 'Error crítico en el servidor', 'System Error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setErrorMessage(null);
    setMode('main');
  };

  const qrUri = otpSecret 
    ? `otpauth://totp/Transcendence:${username}?secret=${otpSecret}&issuer=Transcendence`
    : '';

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        <div className={styles.cardHeader}>
          <span className={styles.headerDot} style={{ background: '#ff3366' }} />
          <span className={styles.headerDot} style={{ background: '#ffaa00' }} />
          <span className={styles.headerDot} style={{ background: '#00ff88' }} />
          <span className={styles.headerTitle}>
            auth_module.ts — {mode}
          </span>
          <span className={`${styles.headerStatus} ${errorMessage ? 'text-[#ff3366]' : 'text-[#ffaa00]'}`}>
            {errorMessage ? 'ERROR_DETECTED' : 'AWAITING_INPUT'}
          </span>
        </div>

        {errorMessage && (
          <div className="p-3 border border-[#ff3366]/50 bg-[#ff3366]/10 text-[#ff3366] font-mono text-xs">
            &gt; {errorMessage}
          </div>
        )}

        {mode === 'main' && (
          <>
            <div className={styles.titleWrap}>
              <span className={styles.titleEye}>// authentication required</span>
              <h1 className={styles.title}><span className={styles.titleAccent}>&gt; </span>connect()</h1>
              <p className={styles.subtitle}>Authenticate with your 42 Network account or use a guest override.</p>
            </div>

            {loading ? (
              <div className={styles.loadingWrap}>
                <div className={styles.loadingSpinner} />
                <span className={styles.loadingText}>redirecting to oauth...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <button className={styles.primaryBtn} onClick={handleOAuth} disabled={loading}>
                  <span className="text-lg font-bold">42</span> authenticate_with_42
                </button>

                <div className="flex items-center gap-2 my-2 opacity-50">
                  <div className="flex-1 border-t border-border-strong"></div>
                  <span className="text-[10px] font-mono text-text-muted tracking-widest">MANUAL_OVERRIDE</span>
                  <div className="flex-1 border-t border-border-strong"></div>
                </div>

                <div className="flex gap-3">
                  <button className={styles.secondaryBtn} onClick={() => setMode('guest_login')}>
                    &gt; guest_login
                  </button>
                  <button className={styles.secondaryBtn} onClick={() => setMode('guest_register')}>
                    &gt; guest_register
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        {mode === 'guest_login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className={styles.titleWrap}>
              <span className={styles.titleEye}>// manual override active</span>
              <h1 className={styles.title}><span className={styles.titleAccent}>&gt; </span>guest_login()</h1>
            </div>
            
            <input 
              type="text" 
              required 
              placeholder="USERNAME_" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className={styles.input} 
            />
            
            <div className="flex flex-col">
              <input 
                type="password" 
                required 
                placeholder="PASSWORD_" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className={styles.input} 
              />
              
              <div className="flex justify-end mt-2 mb-1">
                <button 
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[10px] font-mono text-text-muted hover:text-accent transition-colors cursor-pointer tracking-widest"
                >
                  &gt; RECOVER_PASSWORD
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? 'PROCESSING...' : '> INITIALIZE_LOGIN'}
              </button>
              <button type="button" onClick={resetForm} className={styles.secondaryBtn}>
                &lt;- abort()
              </button>
            </div>
          </form>
        )}

        {mode === 'guest_register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className={styles.titleWrap}>
              <span className={styles.titleEye}>// new entity creation</span>
              <h1 className={styles.title}><span className={styles.titleAccent}>&gt; </span>create_guest()</h1>
            </div>
            
            <input type="text" required placeholder="USERNAME_" value={username} onChange={(e) => setUsername(e.target.value)} className={styles.input} />
            <input type="email" required placeholder="EMAIL_" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} />
            
            <div className="flex flex-col gap-1">
              <input type="password" required placeholder="PASSWORD_" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} />
              
              <span className={`text-[10px] font-mono mt-1 transition-colors ${
                password.length === 0 ? 'text-accent/50' : 
                isPasswordValid ? 'text-green-500' : 'text-[#ff3366]'
              }`}>
                {password.length === 0 ? '> Mínimo 6 caracteres' : 
                 isPasswordValid ? '> Contraseña válida ✓' : '> Faltan caracteres (Mínimo 6) ⚠️'}
              </span>
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              <button type="submit" className={styles.primaryBtn} disabled={loading || !isPasswordValid}>
                {loading ? 'PROCESSING...' : '> COMPILE_RECORD'}
              </button>
              <button type="button" onClick={resetForm} className={styles.secondaryBtn}>
                &lt;- abort()
              </button>
            </div>
          </form>
        )}

        {mode === '2fa_setup' && (
          <div className="flex flex-col items-center gap-6">
            <div className={styles.titleWrap}>
              <span className={styles.titleEye}>// security enhancement required</span>
              <h1 className={styles.title}><span className={styles.titleAccent}>&gt; </span>secure_access()</h1>
            </div>
            
            <p className="font-mono text-[10px] text-text-muted text-center max-w-xs">
              Scan this matrix with your Authenticator application to synchronize the security protocol.
            </p>
            
            <div className="p-4 bg-white rounded-sm shadow-[0_0_20px_rgba(0,212,255,0.3)]">
              <QRCodeSVG value={qrUri} size={180} />
            </div>
            
            <div className="font-mono text-xs text-text-muted bg-bg-elevated p-2 border border-border-strong w-full text-center">
              Secret: <span className="text-accent">{otpSecret}</span>
            </div>

            <button onClick={() => setMode('guest_login')} className={styles.primaryBtn}>
              &gt; PROCEED_TO_LOGIN
            </button>
          </div>
        )}

        {mode === 'email_verify' && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className={styles.titleWrap}>
              <span className={styles.titleEye}>// security enhancement required</span>
              <h1 className={styles.title}><span className={styles.titleAccent}>&gt; </span>awaiting_email()</h1>
            </div>
            
            <div className="p-6 border border-accent bg-accent/5 font-mono animate-pulse w-full">
              <p className="text-sm font-bold text-accent mb-2">IDENTITY LOGGED.</p>
              <p className="text-xs text-text-muted leading-relaxed">
                An encrypted link has been dispatched to your inbox. <br/>
                Awaiting neural sync to activate your account.
              </p>
            </div>

            <button onClick={() => setMode('guest_login')} className={styles.primaryBtn}>
              &gt; PROCEED_TO_LOGIN
            </button>
          </div>
        )}

        {mode === '2fa_verify' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-6 text-center">
            <div className={styles.titleWrap}>
              <span className={styles.titleEye}>// multi-factor authentication</span>
              <h1 className={styles.title}><span className={styles.titleAccent}>&gt; </span>verify_totp()</h1>
            </div>
            
            <input 
              type="text" maxLength={6} required placeholder="000000" 
              value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))} 
              className="w-full bg-transparent border-b-2 border-accent text-accent font-mono text-center text-4xl tracking-[0.5em] py-4 focus:outline-none focus:border-text-primary transition-colors placeholder:text-accent/20"
            />

            <div className="flex flex-col gap-2">
              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? 'VERIFYING...' : '> VALIDATE_TOKEN'}
              </button>
              <button type="button" onClick={resetForm} className={styles.secondaryBtn}>
                &lt;- abort()
              </button>
            </div>
          </form>
        )}

        <p className={styles.footerNote}>
          // by authenticating you agree to the <span className={styles.footerLink}>terms_of_service</span> and <span className={styles.footerLink}>privacy_policy</span>
        </p>

      </div>
    </div>
  );
};
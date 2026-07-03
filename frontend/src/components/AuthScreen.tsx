import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react'; 
import { registerGuest, loginGuest } from '@/services/auth'; 
import { useAuthStore } from '@/store';
import { Button, InlineLoader } from '@/components';
import { TerminalCard } from '@/components/TerminalCard';

type AuthMode = 'login' | 'register' | '2fa_setup' | '2fa_verify';

export const AuthScreen = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [otpSecret, setOtpSecret] = useState<string | null>(null);

  const setUser = useAuthStore((s) => s.setUser); 

  // 🇩🇪 Die Bedingung (La condición de seguridad)
  const isPasswordValid = password.length >= 6;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Bloqueo extra por si envían con el "Enter"
    if (!isPasswordValid) return; 

    setIsLoading(true);
    setError(null);
    try {
      const res = await registerGuest({ username, email, password });
      setOtpSecret(res.otp_secret);
      setMode('2fa_setup');
    } catch (err: any) {
      setError(err.message || 'Error registering');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginGuest({ email, password, totp_code: totpCode });
      
      if (res.token) {
        localStorage.setItem('auth_token', res.token);
        setUser(res.user);
      }
    } catch (err: any) {
      const msg = err.message || 'Error logging in';
      if (msg.includes('Código')) {
        setMode('2fa_verify'); 
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const qrUri = otpSecret 
    ? `otpauth://totp/Transcendence:${username}?secret=${otpSecret}&issuer=Transcendence`
    : '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <TerminalCard
        title={mode === 'login' ? 'sys.login' : mode === 'register' ? 'sys.register' : 'sys.security'}
        status={error ? 'ERROR' : 'AWAITING_INPUT'}
        statusVariant={error ? 'error' : 'active'}
        maxWidth="max-w-[400px]"
      >
        <div className="flex flex-col gap-6">
          
          {/* ERRORES */}
          {error && (
            <div className="p-3 border border-red-500/50 bg-red-500/10 text-red-400 font-mono text-xs">
              &gt; {error}
            </div>
          )}

          {/* 1. MODO: LOGIN o REGISTRO */}
          {(mode === 'login' || mode === 'register') && (
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="flex flex-col gap-4">
              
              {mode === 'register' && (
                <input 
                  type="text" 
                  placeholder="USERNAME_" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-b border-accent/30 text-accent font-mono p-2 focus:outline-none focus:border-accent transition-colors placeholder:text-accent/30"
                  required 
                />
              )}
              
              <input 
                type="email" 
                placeholder="EMAIL_" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-accent/30 text-accent font-mono p-2 focus:outline-none focus:border-accent transition-colors placeholder:text-accent/30"
                required 
              />
              
              <div className="flex flex-col gap-1">
                <input 
                  type="password" 
                  placeholder="PASSWORD_" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-accent/30 text-accent font-mono p-2 focus:outline-none focus:border-accent transition-colors placeholder:text-accent/30"
                  required 
                />
                
                {/* LA ADVERTENCIA EXACTA QUE HAS PEDIDO */}
                {mode === 'register' && (
                  <span className={`text-xs font-mono mt-1 transition-colors ${
                    password.length === 0 ? 'text-accent/50' : 
                    isPasswordValid ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {password.length === 0 ? '> Mínimo 6 caracteres' : 
                     isPasswordValid ? '> Contraseña válida ✓' : '> Faltan caracteres (Mínimo 6) ⚠️'}
                  </span>
                )}
              </div>

              {/* Botón desactivado si es registro y la clave es corta */}
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isLoading || (mode === 'register' && !isPasswordValid)} 
                className="mt-4"
              >
                {isLoading ? <InlineLoader label="Processing..." /> : mode === 'login' ? '> INITIALIZE_LOGIN' : '> CREATE_RECORD'}
              </Button>

              <button 
                type="button" 
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null); // Limpiamos errores al cambiar de modo
                }}
                className="text-xs font-mono text-text-muted hover:text-accent transition-colors mt-2"
              >
                {mode === 'login' ? '[ NO ACCOUNT? REGISTER ]' : '[ ALREADY REGISTERED? LOGIN ]'}
              </button>
            </form>
          )}

          {/* ... MODO 2FA SETUP y MODO 2FA VERIFY se quedan exactamente igual ... */}
          {/* 2. MODO: SETUP 2FA (Al registrarse) */}
          {mode === '2fa_setup' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="font-mono text-sm text-text-muted">
                &gt; SECURE YOUR ACCOUNT. Scan this code with Google Authenticator or Authy.
              </p>
              
              <div className="p-4 bg-white rounded-sm shadow-[0_0_15px_rgba(var(--color-accent),0.3)]">
                <QRCodeSVG value={qrUri} size={200} />
              </div>
              
              <div className="font-mono text-xs text-text-muted">
                Manual code: <span className="text-accent">{otpSecret}</span>
              </div>

              <Button onClick={() => setMode('login')} variant="primary" className="mt-4 w-full">
                &gt; CONTINUE_TO_LOGIN
              </Button>
            </div>
          )}

          {/* 3. MODO: VERIFICACIÓN 2FA (Al hacer login) */}
          {mode === '2fa_verify' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4 text-center">
              <p className="font-mono text-sm text-text-muted">
                &gt; ENTER 6-DIGIT SECURITY CODE_
              </p>
              
              <input 
                type="text" 
                maxLength={6}
                placeholder="000000" 
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))} 
                className="w-full bg-transparent border border-accent/50 text-accent font-mono text-center text-2xl tracking-[1em] py-3 focus:outline-none focus:border-accent transition-colors placeholder:text-accent/20"
                required 
              />

              <Button type="submit" variant="primary" disabled={isLoading} className="mt-2">
                {isLoading ? <InlineLoader label="Verifying..." /> : '> VERIFY_ACCESS'}
              </Button>
              
              <button 
                type="button" 
                onClick={() => setMode('login')}
                className="text-xs font-mono text-text-muted hover:text-accent transition-colors"
              >
                [ CANCEL ]
              </button>
            </form>
          )}

        </div>
      </TerminalCard>
    </div>
  );
};
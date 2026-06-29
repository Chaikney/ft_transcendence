import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { createSudokuGame } from '@/features/sudoku/service';

// ── Mock match history ──────────
const MOCK_HISTORY = [
  { id: '001', game: 'chess',  result: 'win',  opponent: 'jlopez',   elo_delta: +18, date: '2024-01-15' },
  { id: '002', game: 'sudoku', result: 'win',  opponent: 'CPU',      elo_delta: +12, date: '2024-01-14' },
  { id: '003', game: 'chess',  result: 'loss', opponent: 'agarcia',  elo_delta: -15, date: '2024-01-13' },
  { id: '004', game: 'chess',  result: 'draw', opponent: 'msmith',   elo_delta: +2,  date: '2024-01-12' },
];

// ── Styles ────────────────────────────────────────────────────────────────
const styles = {
  page: 'min-h-screen flex flex-col items-center px-6 py-12 gap-8',
  sectionLabel: 'w-full max-w-2xl text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted mb-1',
  card: 'w-full max-w-2xl terminal-card bracket-corners',
  cardHeader: 'flex items-center gap-2 px-4 py-2 border-b border-border-strong',
  headerDot: 'w-2 h-2 rounded-full',
  headerTitle: 'text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted flex-1',
  headerPing: 'text-[10px] font-mono text-accent tracking-widest',
  cardBody: 'p-5',
  userRow: 'flex items-center justify-between mb-5',
  userLeft: 'flex flex-col gap-1',
  userHandle: 'text-xl font-mono font-bold text-text-primary tracking-tight',
  userHandleAccent: 'text-accent',
  userSince: 'text-[10px] font-mono text-text-muted',
  userRight: 'flex flex-col items-end gap-1',
  eloValue: 'text-3xl font-mono font-bold text-accent drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]',
  eloLabel: 'text-[10px] font-mono text-text-muted tracking-widest uppercase',
  avatar: 'w-20 h-20 border-2 border-accent rounded-sm object-cover shadow-[0_0_12px_rgba(0,212,255,0.3)]',
  statsGrid: 'grid grid-cols-3 gap-3 mb-5',
  statCard: 'flex flex-col gap-1 p-3 border border-border bg-bg-elevated',
  statValue: 'text-lg font-mono font-bold text-text-primary',
  statLabel: 'text-[9px] font-mono text-text-muted tracking-widest uppercase',
  tableWrap: 'overflow-hidden',
  tableHead: 'grid grid-cols-5 gap-2 px-3 py-2 border-b border-border text-[9px] font-mono text-text-muted tracking-widest uppercase',
  tableRow: 'grid grid-cols-5 gap-2 px-3 py-2 border-b border-border-subtle text-[10px] font-mono text-text-secondary hover:bg-bg-elevated transition-colors duration-fast',
  resultWin: 'text-[#00ff88] font-bold',
  resultLoss: 'text-[#ff3366] font-bold',
  resultDraw: 'text-[#ffaa00] font-bold',
  actionRow: 'flex items-center gap-3 mt-2',
  actionBtn: 'px-4 py-2 font-mono text-xs tracking-widest uppercase border transition-all duration-base cursor-pointer',
  actionBtnPrimary: 'border-accent-border text-accent bg-accent-bg hover:bg-accent hover:text-bg-base hover:shadow-[0_0_12px_rgba(0,212,255,0.3)]',
  actionBtnSecondary: 'border-border-strong text-text-muted hover:border-accent-border hover:text-text-secondary',
  inputGroup: 'flex flex-col gap-2 mt-4 pt-4 border-t border-border-strong',
  input: 'w-full bg-bg-base border border-border-strong p-2 text-xs font-mono text-text-primary focus:border-accent outline-none',
  qrContainer: 'bg-white p-2 rounded-sm w-fit mt-2',
} as const;

// ── Component ──────────────────────────────────────────────────────────────
export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate     = useNavigate();
  const currentUser  = useAuthStore((s) => s.user);
  const setUser      = useAuthStore((s) => s.setUser);
  const clearUser    = useAuthStore((s) => s.clearUser);

  const [editUrl, setEditUrl] = useState('');
  
  // Estados para el 2FA
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
  const [twoFaCode, setTwoFaCode] = useState('');
  const [mfaMessage, setMfaMessage] = useState('');

  useEffect(() => {
    if (currentUser?.avatar_url) setEditUrl(currentUser.avatar_url);
  }, [currentUser]);

  const wins    = MOCK_HISTORY.filter((m) => m.result === 'win').length;
  const losses  = MOCK_HISTORY.filter((m) => m.result === 'loss').length;
  const total   = MOCK_HISTORY.length;

  const isOwnProfile = currentUser?.username === username;

  // 1. Guardar el Avatar
  const handleUpdate = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ user: { avatar_url: editUrl } })
      });
      if (response.ok) {
        const { user: updatedUser } = await response.json();
        setUser(updatedUser);
      }
    } catch (e) { console.error("Error updating profile", e); }
  };

  // 2. Pedir el QR para el 2FA
  const handleGenerate2FA = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/profile/2fa/enable', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setQrCodeSvg(data.qr_svg); // Guardamos el SVG en el estado
        setMfaMessage('');
      }
    } catch (e) { console.error("Error fetching QR", e); }
  };

  // 3. Verificar el código de 6 números
  const handleVerify2FA = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/profile/2fa/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ code: twoFaCode })
      });
      
      if (response.ok) {
        setMfaMessage('✔️ SYSTEM SECURED: 2FA ENABLED');
        setQrCodeSvg(null); // Ocultamos el QR al terminar
        setTwoFaCode('');
      } else {
        setMfaMessage('❌ ERROR: INVALID CODE');
      }
    } catch (e) { console.error("Error verifying 2FA", e); }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    clearUser();
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      {/* ── User Card Section ── */}
      <span className={styles.sectionLabel}>// user_profile.ts</span>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.headerDot} style={{ background: '#ff3366' }} />
          <span className={styles.headerDot} style={{ background: '#ffaa00' }} />
          <span className={styles.headerDot} style={{ background: '#00ff88' }} />
          <span className={styles.headerTitle}>profile — {username}</span>
          <span className={styles.headerPing}>● ACTIVE</span>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.userRow}>
            <div className="flex items-center gap-4">
              <img src={currentUser?.avatar_url || '/default-avatar.png'} className={styles.avatar} alt="Profile" />
              <div className={styles.userLeft}>
                <h1 className={styles.userHandle}>
                  <span className={styles.userHandleAccent}>&gt; </span>
                  {username}
                </h1>
                <span className={styles.userSince}>// member since 2026</span>
              </div>
            </div>
            <div className={styles.userRight}>
              <span className={styles.eloValue}>{currentUser?.elo ?? 1200}</span>
              <span className={styles.eloLabel}>ELO rating</span>
            </div>
          </div>

          {/* ── Avatar Edit ── */}
          {isOwnProfile && (
            <div className={styles.inputGroup}>
              <span className={styles.sectionLabel}>// edit_avatar_url</span>
              <div className="flex gap-2">
                <input className={styles.input} value={editUrl} onChange={(e) => setEditUrl(e.target.value)} placeholder="https://..." />
                <button className={[styles.actionBtn, styles.actionBtnPrimary].join(' ')} onClick={handleUpdate}>
                  save
                </button>
              </div>
            </div>
          )}

          {/* ── 2FA Security Section (Solo para tu propio perfil) ── */}
          {isOwnProfile && (
            <div className={styles.inputGroup}>
              <span className={styles.sectionLabel}>// security_2fa</span>
              
              {!qrCodeSvg && !mfaMessage && (
                <button className={[styles.actionBtn, styles.actionBtnSecondary].join(' ')} onClick={handleGenerate2FA} style={{ width: 'fit-content' }}>
                  &gt; init_2fa()
                </button>
              )}

              {/* Pantalla del QR */}
              {qrCodeSvg && (
                <div className="flex flex-col gap-3 mt-2">
                  <p className="text-[10px] text-text-muted uppercase font-mono">Scan this with Google Authenticator:</p>
                  
                  {/* Aquí inyectamos el SVG que manda Rails */}
                  <div className={styles.qrContainer} dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
                  
                  <div className="flex gap-2 mt-2">
                    <input 
                      className={styles.input} 
                      value={twoFaCode} 
                      onChange={(e) => setTwoFaCode(e.target.value)} 
                      placeholder="Enter 6-digit code..." 
                      maxLength={6}
                    />
                    <button className={[styles.actionBtn, styles.actionBtnPrimary].join(' ')} onClick={handleVerify2FA}>
                      verify
                    </button>
                  </div>
                </div>
              )}

              {/* Mensaje de Feedback */}
              {mfaMessage && (
                <p className="text-xs font-mono mt-2" style={{ color: mfaMessage.includes('ERROR') ? '#ff3366' : '#00ff88' }}>
                  {mfaMessage}
                </p>
              )}
            </div>
          )}

          {/* ── Stats ── */}
          <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
            {[{ label: 'total', value: total }, { label: 'wins', value: wins, color: '#00ff88' }, { label: 'losses', value: losses, color: '#ff3366' }].map(({ label, value, color }) => (
              <div key={label} className={styles.statCard}>
                <span className={styles.statValue} style={{ color: color ?? 'var(--text-primary)' }}>{value}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>

          {/* ── Actions ── */}
          {isOwnProfile && (
            <div className={styles.actionRow}>
              <button
                className={[styles.actionBtn, styles.actionBtnPrimary].join(' ')}
                onClick={() => navigate('/game/chess/chess-new')}
              >
                &gt; play_chess()
              </button>
              <button
                className={[styles.actionBtn, styles.actionBtnPrimary].join(' ')}
                onClick={async () => {
                  try {
                    const res = await createSudokuGame('easy');

                    // Verificamos si res es un objeto y tiene la propiedad 'id'
                    if (res && typeof res === 'object' && 'id' in res) {
                      const newGame = res as { id: number }; // Ahora es seguro
                      navigate(`/game/sudoku/sudoku-${String(newGame.id).padStart(3, '0')}`);
                    } else {
                      console.error("Invalid game response:", res);
                    }
                  } catch (err) {
                    console.error("Error al crear juego:", err);
                  }
              }}
              >
                &gt; play_sudoku()
              </button>
              <button
                className={[styles.actionBtn, styles.actionBtnSecondary].join(' ')}
                onClick={handleLogout}
              >
                &gt; logout()
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Match History Section ── */}
      <span className={styles.sectionLabel}>// match_history[]</span>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.headerDot} style={{ background: '#ff3366' }} />
          <span className={styles.headerDot} style={{ background: '#ffaa00' }} />
          <span className={styles.headerDot} style={{ background: '#00ff88' }} />
          <span className={styles.headerTitle}>match_history — last {MOCK_HISTORY.length} games</span>
        </div>

        <div className={styles.tableWrap}>
          <div className={styles.tableHead}>
            <span>#</span>
            <span>game</span>
            <span>opponent</span>
            <span>result</span>
            <span>elo Δ</span>
          </div>

          {MOCK_HISTORY.map((match) => (
            <div key={match.id} className={styles.tableRow}>
              <span style={{ color: 'var(--text-muted)' }}>{match.date}</span>
              <span style={{ color: 'var(--accent)' }}>{match.game}</span>
              <span>{match.opponent}</span>
              <span className={match.result === 'win' ? styles.resultWin : match.result === 'loss' ? styles.resultLoss : styles.resultDraw}>
                {match.result.toUpperCase()}
              </span>
              <span style={{ color: match.elo_delta > 0 ? '#00ff88' : match.elo_delta < 0 ? '#ff3366' : 'var(--text-muted)' }}>
                {match.elo_delta > 0 ? `+${match.elo_delta}` : match.elo_delta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
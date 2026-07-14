import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { createSudokuGame } from '@/features/sudoku/service';
import { FriendsList } from '@/features/friends/FriendsList';
import { AvatarPicker } from '@/components/AvatarPicker';
import { Avatar } from '@/components/Avatar';

// ── Styles ────────────────────────────────────────────────────────────────
const styles = {
  page: 'min-h-screen flex flex-col lg:flex-row justify-center items-start px-6 py-12 gap-8 w-full max-w-[1400px] mx-auto',
  leftColumn: 'flex flex-col items-center gap-8 w-full max-w-2xl',
  rightColumn: 'w-full lg:w-[400px] flex flex-col gap-1 h-[750px]',
  sectionLabel: 'w-full text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted mb-1',
  card: 'w-full terminal-card bracket-corners',
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

export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate     = useNavigate();
  const currentUser  = useAuthStore((s) => s.user);
  const setUser      = useAuthStore((s) => s.setUser);
  const clearUser    = useAuthStore((s) => s.clearUser);

  const isOwnProfile = currentUser?.username === username;

  // 🚀 NUEVOS ESTADOS: Datos dinámicos del perfil que estamos visitando
  const [profileUser, setProfileUser] = useState<any>(null);
  const [h2hStats, setH2hStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showPicker, setShowPicker] = useState(false);
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
  const [twoFaCode, setTwoFaCode] = useState('');
  const [mfaMessage, setMfaMessage] = useState('');

  // 🚀 EL MOTOR DE BÚSQUEDA: Se dispara cada vez que cambia el "username" en la URL
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
          const response = await fetch(`${BASE_URL}/users/${username}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileUser(data.user);
          if (data.h2h) setH2hStats(data.h2h);
        } else {
          setProfileUser(null);
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchProfileData();
    }
  }, [username]);

  const handleGenerate2FA = async () => { /* ... igual ... */ };
  const handleVerify2FA = async () => { /* ... igual ... */ };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    clearUser();
    navigate('/login');
  };

  // Pantalla de carga mientras trae los datos de la base de datos
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-accent font-mono animate-pulse">_fetching_identity...</div>;
  }

  // Si buscamos a un usuario que no existe
  if (!profileUser) {
    return <div className="min-h-screen flex items-center justify-center text-[#ff3366] font-mono">ERROR: ENTITY NOT FOUND</div>;
  }

  // Variables para la tabla (se llenarán cuando el backend devuelva el array de match_history)
  const matchHistory = profileUser.match_history || [];
  const wins         = profileUser.wins || 0;
  const losses       = profileUser.losses || 0;
  const total        = wins + losses;

  return (
    <div className={styles.page}>

      {/* ── COLUMNA IZQUIERDA: Perfil e Historial ── */}
      <div className={styles.leftColumn}>
        <div className="w-full">
          <span className={styles.sectionLabel}>// user_profile.ts</span>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.headerDot} style={{ background: '#ff3366' }} />
              <span className={styles.headerDot} style={{ background: '#ffaa00' }} />
              <span className={styles.headerDot} style={{ background: '#00ff88' }} />
              <span className={styles.headerTitle}>profile — {profileUser.username}</span>
              <span className={styles.headerPing} style={{ color: profileUser.status === 'online' ? '#00ff88' : '#6a6a7a' }}>
                ● {profileUser.status?.toUpperCase() || 'OFFLINE'}
              </span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.userRow}>
                <div className="flex items-center gap-4">
                  <div className="relative w-fit">
                    <button
                      onClick={() => isOwnProfile && setShowPicker(!showPicker)}
                      className={`relative group block rounded-sm border border-accent overflow-hidden ${isOwnProfile ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <img
                        src={profileUser.avatar_url || '/avatars/default.png'}
                        className={`w-20 h-20 object-cover transition-opacity ${isOwnProfile ? 'group-hover:opacity-30' : ''}`}
                        alt="Profile"
                      />
                      {isOwnProfile && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-mono text-white bg-black/60 px-2 py-1 rounded">EDIT</span>
                        </div>
                      )}
                    </button>

                    {showPicker && isOwnProfile && (
                      <div className="absolute top-full mt-2 left-0 z-50">
                        <AvatarPicker
                          currentAvatar={currentUser?.avatar_url || ''}
                          onSelect={async (newAvatarPath) => {
                            try {
                                const response = await fetch(`${BASE_URL}/profile`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                                },
                                body: JSON.stringify({ user: { avatar_url: newAvatarPath } })
                              });

                              if (response.ok) {
                                //console.log("Avatar actualizado con éxito");
                                setProfileUser((prev: any) => ({ ...prev, avatar_url: newAvatarPath }));
                              }
                            } catch (err) {
                              console.error("Error al actualizar avatar:", err);
                            }
                            setShowPicker(false);
                          }}
                          onClose={() => setShowPicker(false)}
                        />
                      </div>
                    )}
                  </div>
                  <div className={styles.userLeft}>
                    <h1 className={styles.userHandle}>
                      <span className={styles.userHandleAccent}>&gt; </span>
                      {profileUser.username}
                    </h1>
                    <span className={styles.userSince}>// verified identity</span>
                  </div>
                </div>
                <div className={styles.userRight}>
                  <span className={styles.eloValue}>{profileUser.elo ?? 100}</span>
                  <span className={styles.eloLabel}>ELO rating</span>
                </div>
              </div>

              {/* 🛡️ 2FA Security Section (SOLO VISIBLE SI ES TU PERFIL) */}
              {isOwnProfile && (
                <div className={styles.inputGroup}>
                  {/* ... código del 2FA igual que lo tenías ... */}
                </div>
              )}

              {/* 📊 ESTADÍSTICAS GLOBALES (SI ES TU PERFIL) */}
              {isOwnProfile && (
                <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
                  {[{ label: 'total', value: total }, { label: 'wins', value: wins, color: '#00ff88' }, { label: 'losses', value: losses, color: '#ff3366' }].map(({ label, value, color }) => (
                    <div key={label} className={styles.statCard}>
                      <span className={styles.statValue} style={{ color: color ?? 'var(--text-primary)' }}>{value}</span>
                      <span className={styles.statLabel}>{label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ⚔️ ESTADÍSTICAS CARA A CARA (SI ESTÁS VISITANDO A OTRO Y HAY DATOS) */}
              {!isOwnProfile && h2hStats && (
                <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
                  <div className={styles.statCard} style={{ border: '1px solid rgba(0, 212, 255, 0.3)' }}>
                    <span className={styles.statValue} style={{ color: 'var(--accent)' }}>{h2hStats.total}</span>
                    <span className={styles.statLabel}>H2H MATCHES</span>
                  </div>
                  <div className={styles.statCard} style={{ border: '1px solid rgba(0, 255, 136, 0.3)' }}>
                    <span className={styles.statValue} style={{ color: '#00ff88' }}>{h2hStats.wins}</span>
                    <span className={styles.statLabel}>YOU WON</span>
                  </div>
                  <div className={styles.statCard} style={{ border: '1px solid rgba(255, 51, 102, 0.3)' }}>
                    <span className={styles.statValue} style={{ color: '#ff3366' }}>{h2hStats.losses}</span>
                    <span className={styles.statLabel}>THEY WON</span>
                  </div>
                </div>
              )}

              {/* 🎮 Actions (SOLO SI ES TU PERFIL) */}
              {isOwnProfile && (
                <div className={styles.actionRow}>
                  <button
                    className={[styles.actionBtn, styles.actionBtnPrimary].join(' ')}
                    onClick={async () => {
                      try {
                          const response = await fetch(`${BASE_URL}/games`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                          },
                          body: JSON.stringify({}) // Pide al backend que cree la partida oficial
                        });

                        const data = await response.json();

                        if (response.ok && data.game_id) {
                          navigate(`/game/chess/chess-${data.game_id}`);
                        }
                      } catch (err) {
                        console.error("Error al crear la partida de ajedrez:", err);
                      }
                    }}
                  >
                    &gt; play_chess()
                  </button>
                  <button className={[styles.actionBtn, styles.actionBtnPrimary].join(' ')} onClick={async () => {
                      try {
                        const res = await createSudokuGame('easy');
                        if (res && typeof res === 'object' && 'id' in res) {
                          navigate(`/game/sudoku/sudoku-${String((res as {id: number}).id).padStart(3, '0')}`);
                        }
                      } catch (err) { console.error("Error al crear juego:", err); }
                    }}>&gt; play_sudoku()</button>
                  <button className={[styles.actionBtn, styles.actionBtnSecondary].join(' ')} onClick={handleLogout}>&gt; logout()</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Match History Section */}
        <div className="w-full mt-8">
          <span className={styles.sectionLabel}>// combat_logs</span>

          <div className="flex flex-col gap-2 mt-3">
            {(!profileUser.match_history || profileUser.match_history.length === 0) ? (
              <div className="flex items-center justify-center py-8 border border-[#1a1a24] bg-[#0a0a0f] rounded">
                <span className="text-xs font-mono text-[#4a4a5a]">// no matches recorded yet</span>
              </div>
            ) : (
              profileUser.match_history.map((match: any) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 border border-[#1a1a24] bg-[#0c0c12] hover:border-[#2a2a35] transition-colors rounded"
                >

                  {/* ⚪ BLANCAS (Izquierda) */}
                  <div className="flex items-center gap-3 w-2/5">
                    <Avatar
                      src={match.white.avatar_url && match.white.avatar_url.length > 0 ? match.white.avatar_url : undefined}
                      username={match.white.username}
                      size="sm"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xs text-gray-200 truncate">{match.white.username}</span>
                      <span className="font-mono text-[10px] text-[#6a6a7a]">ELO: {match.white.elo}</span>
                    </div>
                  </div>

                  {/* ⚔️ RESULTADO (Centro) */}
                  <div className="flex justify-center w-1/5">
                    <span className="font-mono text-xs tracking-widest px-2 py-1 bg-[#1a1a24] border border-[#2a2a35] text-[#00d4ff] rounded">
                      {match.result}
                    </span>
                  </div>

                  {/* ⚫ NEGRAS (Derecha) */}
                  <div className="flex items-center justify-end gap-3 w-2/5 text-right">
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xs text-gray-200 truncate">{match.black.username}</span>
                      <span className="font-mono text-[10px] text-[#6a6a7a]">ELO: {match.black.elo}</span>
                    </div>
                    <Avatar
                      src={match.black.avatar_url && match.black.avatar_url.length > 0 ? match.black.avatar_url : undefined}
                      username={match.black.username}
                      size="sm"
                    />
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── COLUMNA DERECHA: El Radar de Amigos (SOLO EN TU PERFIL) ── */}
      {isOwnProfile && (
        <div className={styles.rightColumn}>
          <span className={styles.sectionLabel}>// network_connections</span>
          <div className="flex-1 terminal-card bracket-corners overflow-hidden border border-border-strong shadow-[0_0_15px_rgba(255,51,102,0.05)]">
            <FriendsList />
          </div>
        </div>
      )}

    </div>
  );
};

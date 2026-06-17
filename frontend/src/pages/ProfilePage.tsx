import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { FriendsList } from '@/features/friends/FriendsList';
import { TerminalCard } from '@/components/TerminalCard';

// ── Mock data ────────────────────────────────────────────────────────────
const MOCK_HISTORY = [
  { id: '001', game: 'chess',  result: 'win',  opponent: 'jlopez',   elo_delta: +18, date: '2024-01-15' },
  { id: '002', game: 'sudoku', result: 'win',  opponent: 'CPU',      elo_delta: +12, date: '2024-01-14' },
  { id: '003', game: 'chess',  result: 'loss', opponent: 'agarcia',  elo_delta: -15, date: '2024-01-13' },
  { id: '004', game: 'chess',  result: 'draw', opponent: 'msmith',   elo_delta: +2,  date: '2024-01-12' },
];

// ── Styles ────────────────────────────────────────────────────────────────
// Manteniendo tus clases de estilo existentes para consistencia visual
const styles = {
  page: 'min-h-screen flex flex-col items-center px-6 py-12 gap-8',
  sectionLabel: 'w-full max-w-2xl text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted mb-1',
  card: 'w-full max-w-2xl terminal-card bracket-corners',
  cardHeader: 'flex items-center gap-2 px-4 py-2 border-b border-border-strong',
  headerDot: 'w-2 h-2 rounded-full',
  headerTitle: 'text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted flex-1',
  cardBody: 'p-5',
  // ... resto de estilos del componente original
} as const;

export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);

  const wins = MOCK_HISTORY.filter((m) => m.result === 'win').length;
  const isOwnProfile = currentUser?.username === username;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    clearUser();
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      
      {/* ── User Profile Card ── */}
      <span className={styles.sectionLabel}>// user_profile.ts</span>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.headerDot} style={{ background: '#ff3366' }} />
          <span className={styles.headerTitle}>profile — {username}</span>
        </div>
        <div className={styles.cardBody}>
          <h1 className="text-xl font-mono text-text-primary">&gt; {username}</h1>
          <span className="text-accent text-3xl font-bold font-mono">
            {currentUser?.elo ?? 1200} ELO
          </span>
          
          {isOwnProfile && (
            <button className="mt-4 border px-4 py-2 text-xs font-mono" onClick={handleLogout}>
              &gt; logout()
            </button>
          )}
        </div>
      </div>

      {/* ── Match History ── */}
      <span className={styles.sectionLabel}>// match_history[]</span>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.headerTitle}>match_history</span>
        </div>
        {/* Renderizado de historial... */}
      </div>

      {/* ── Friends List (Integración Solicitada) ── */}
      <span className={styles.sectionLabel}>// friends_list.ts</span>
      <div className="w-full max-w-2xl">
        <TerminalCard title="friends" maxWidth="max-w-2xl" padding="p-0">
          <FriendsList />
        </TerminalCard>
      </div>

    </div>
  );
};
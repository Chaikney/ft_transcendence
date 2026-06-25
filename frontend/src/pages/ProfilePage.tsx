import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { createSudokuGame } from '@/features/sudoku/service';

// ── Mock match history (replace with API call when backend ready) ──────────
const MOCK_HISTORY = [
  { id: '001', game: 'chess',  result: 'win',  opponent: 'jlopez',   elo_delta: +18, date: '2024-01-15' },
  { id: '002', game: 'sudoku', result: 'win',  opponent: 'CPU',      elo_delta: +12, date: '2024-01-14' },
  { id: '003', game: 'chess',  result: 'loss', opponent: 'agarcia',  elo_delta: -15, date: '2024-01-13' },
  { id: '004', game: 'chess',  result: 'draw', opponent: 'msmith',   elo_delta: +2,  date: '2024-01-12' },
  { id: '005', game: 'sudoku', result: 'win',  opponent: 'CPU',      elo_delta: +10, date: '2024-01-11' },
  { id: '006', game: 'chess',  result: 'win',  opponent: 'rperez',   elo_delta: +20, date: '2024-01-10' },
];

// ── Styles ────────────────────────────────────────────────────────────────
const styles = {
  page:
    'min-h-screen flex flex-col items-center ' +
    'px-6 py-12 gap-8',

  // Section label
  sectionLabel:
    'w-full max-w-2xl text-[10px] font-mono tracking-[0.2em] ' +
    'uppercase text-text-muted mb-1',

  // Terminal card
  card:
    'w-full max-w-2xl terminal-card bracket-corners',

  cardHeader:
    'flex items-center gap-2 px-4 py-2 border-b border-border-strong',
  headerDot:
    'w-2 h-2 rounded-full',
  headerTitle:
    'text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted flex-1',
  headerPing:
    'text-[10px] font-mono text-accent tracking-widest',

  cardBody:
    'p-5',

  // User hero row
  userRow:
    'flex items-center justify-between mb-5',
  userLeft:
    'flex flex-col gap-1',
  userHandle:
    'text-xl font-mono font-bold text-text-primary tracking-tight',
  userHandleAccent:
    'text-accent',
  userSince:
    'text-[10px] font-mono text-text-muted',

  userRight:
    'flex flex-col items-end gap-1',
  eloValue:
    'text-3xl font-mono font-bold text-accent ' +
    'drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]',
  eloLabel:
    'text-[10px] font-mono text-text-muted tracking-widest uppercase',

  // Stats grid
  statsGrid:
    'grid grid-cols-3 gap-3 mb-5',
  statCard:
    'flex flex-col gap-1 p-3 border border-border bg-bg-elevated',
  statValue:
    'text-lg font-mono font-bold text-text-primary',
  statLabel:
    'text-[9px] font-mono text-text-muted tracking-widest uppercase',

  // Win rate bar
  barWrap:
    'mb-5',
  barLabel:
    'flex items-center justify-between mb-1',
  barLabelText:
    'text-[10px] font-mono text-text-muted tracking-widest uppercase',
  barLabelVal:
    'text-[10px] font-mono text-accent',
  barOuter:
    'h-1.5 bg-bg-elevated border border-border w-full',
  barInner:
    'h-full bg-accent transition-all duration-slow',

  // Match history table
  tableWrap:
    'overflow-hidden',
  tableHead:
    'grid grid-cols-5 gap-2 px-3 py-2 border-b border-border ' +
    'text-[9px] font-mono text-text-muted tracking-widest uppercase',
  tableRow:
    'grid grid-cols-5 gap-2 px-3 py-2 border-b border-border-subtle ' +
    'text-[10px] font-mono text-text-secondary ' +
    'hover:bg-bg-elevated transition-colors duration-fast',
  resultWin:
    'text-[#00ff88] font-bold',
  resultLoss:
    'text-[#ff3366] font-bold',
  resultDraw:
    'text-[#ffaa00] font-bold',
  eloDeltaPos:
    'text-[#00ff88]',
  eloDeltaNeg:
    'text-[#ff3366]',
  eloDeltaNeu:
    'text-text-muted',

  // Action row
  actionRow:
    'flex items-center gap-3 mt-2',
  actionBtn:
    'px-4 py-2 font-mono text-xs tracking-widest uppercase border ' +
    'transition-all duration-base cursor-pointer',
  actionBtnPrimary:
    'border-accent-border text-accent bg-accent-bg ' +
    'hover:bg-accent hover:text-bg-base ' +
    'hover:shadow-[0_0_12px_rgba(0,212,255,0.3)]',
  actionBtnSecondary:
    'border-border-strong text-text-muted ' +
    'hover:border-accent-border hover:text-text-secondary',
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────
const getResultClass = (result: string, s: typeof styles) => {
  if (result === 'win')  return s.resultWin;
  if (result === 'loss') return s.resultLoss;
  return s.resultDraw;
};

const getDeltaClass = (delta: number, s: typeof styles) => {
  if (delta > 0) return s.eloDeltaPos;
  if (delta < 0) return s.eloDeltaNeg;
  return s.eloDeltaNeu;
};

// ── Component ──────────────────────────────────────────────────────────────
export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate     = useNavigate();
  const currentUser  = useAuthStore((s) => s.user);
  const clearUser    = useAuthStore((s) => s.clearUser);

  // Derive stats from mock history
  const wins   = MOCK_HISTORY.filter((m) => m.result === 'win').length;
  const losses = MOCK_HISTORY.filter((m) => m.result === 'loss').length;
  const draws  = MOCK_HISTORY.filter((m) => m.result === 'draw').length;
  const total  = MOCK_HISTORY.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  const isOwnProfile = currentUser?.username === username;

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    clearUser();
    navigate('/login');
  };

  return (
    <div className={styles.page}>

      {/* ── User card ── */}
      <span className={styles.sectionLabel}>// user_profile.ts</span>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.headerDot} style={{ background: '#ff3366' }} />
          <span className={styles.headerDot} style={{ background: '#ffaa00' }} />
          <span className={styles.headerDot} style={{ background: '#00ff88' }} />
          <span className={styles.headerTitle}>
            profile — {username}
          </span>
          <span className={styles.headerPing}>● ACTIVE</span>
        </div>

        <div className={styles.cardBody}>

          {/* User row */}
          <div className={styles.userRow}>
            <div className={styles.userLeft}>
              <h1 className={styles.userHandle}>
                <span className={styles.userHandleAccent}>&gt; </span>
                {username}
              </h1>
              <span className={styles.userSince}>
                // member since 2026 · transcendence
              </span>
            </div>
            <div className={styles.userRight}>
              <span className={styles.eloValue}>
                {currentUser?.elo ?? 1200}
              </span>
              <span className={styles.eloLabel}>ELO rating</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className={styles.statsGrid}>
            {[
              { label: 'total games', value: total },
              { label: 'wins',        value: wins,   color: '#00ff88' },
              { label: 'losses',      value: losses, color: '#ff3366' },
            ].map(({ label, value, color }) => (
              <div key={label} className={styles.statCard}>
                <span
                  className={styles.statValue}
                  style={{ color: color ?? 'var(--text-primary)' }}
                >
                  {value}
                </span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>

          {/* Win rate bar */}
          <div className={styles.barWrap}>
            <div className={styles.barLabel}>
              <span className={styles.barLabelText}>win rate</span>
              <span className={styles.barLabelVal}>{winRate}%</span>
            </div>
            <div className={styles.barOuter}>
              <div
                className={styles.barInner}
                style={{ width: `${winRate}%` }}
              />
            </div>
          </div>

          {/* Action row */}
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
                    const newGame = res as { id: number };
                    navigate(`/game/sudoku/sudoku-${String(newGame.id).padStart(3, '0')}`);
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

      {/* ── Match history ── */}
      <span className={styles.sectionLabel}>// match_history[]</span>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.headerDot} style={{ background: '#ff3366' }} />
          <span className={styles.headerDot} style={{ background: '#ffaa00' }} />
          <span className={styles.headerDot} style={{ background: '#00ff88' }} />
          <span className={styles.headerTitle}>
            match_history — last {MOCK_HISTORY.length} games
          </span>
        </div>

        <div className={styles.tableWrap}>
          {/* Head */}
          <div className={styles.tableHead}>
            <span>#</span>
            <span>game</span>
            <span>opponent</span>
            <span>result</span>
            <span>elo Δ</span>
          </div>

          {/* Rows */}
          {MOCK_HISTORY.map((match) => (
            <div key={match.id} className={styles.tableRow}>
              <span style={{ color: 'var(--text-muted)' }}>
                {match.date}
              </span>
              <span style={{ color: 'var(--accent2)' }}>
                {match.game}
              </span>
              <span>{match.opponent}</span>
              <span className={getResultClass(match.result, styles)}>
                {match.result.toUpperCase()}
              </span>
              <span className={getDeltaClass(match.elo_delta, styles)}>
                {match.elo_delta > 0 ? `+${match.elo_delta}` : match.elo_delta}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
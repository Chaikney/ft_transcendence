import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import type { ConnectionStatusType } from '@/types';

// ── Styles ────────────────────────────────────────────────────────────────
const styles = {
  shell:
    'min-h-screen bg-bg-base flex flex-col',

  // Fixed navbar
  nav:
    'fixed top-0 left-0 right-0 z-50 h-12 ' +
    'flex items-center justify-between px-6 ' +
    'bg-bg-base/95 backdrop-blur-sm ' +
    'border-b border-border-strong',

  // Left — logo
  logoWrap:
    'flex items-center gap-3 cursor-pointer select-none',
  logoBracket:
    'text-accent font-mono text-sm font-bold',
  logoText:
    'text-text-primary font-mono text-sm font-bold tracking-widest uppercase',
  logoDim:
    'text-text-muted font-mono text-xs',

  // Center — nav links
  navLinks:
    'flex items-center gap-1',
  navLink:
    'px-3 py-1 font-mono text-xs tracking-widest uppercase ' +
    'transition-all duration-base border ' +
    'cursor-pointer',
  navLinkActive:
    'text-accent border-accent-border bg-accent-bg ' +
    'shadow-[0_0_8px_rgba(0,212,255,0.2)]',
  navLinkInactive:
    'text-text-muted border-transparent ' +
    'hover:text-text-secondary hover:border-border-strong',

  // Right — status + user
  navRight:
    'flex items-center gap-4',
  statusWrap:
    'flex items-center gap-2',
  statusDot:
    'w-1.5 h-1.5 rounded-full',
  statusLabel:
    'text-[10px] font-mono tracking-widest uppercase',
  userWrap:
    'flex items-center gap-2 px-2 py-1 ' +
    'border border-border-strong ' +
    'font-mono text-xs text-text-secondary',
  userElo:
    'text-accent',

  // Content — padded below navbar
  content:
    'flex-1 pt-12 relative',

  // Grid bg
  gridBg:
    'fixed inset-0 pointer-events-none ' +
    'opacity-[0.06] z-0 ' +
    '[background-image:linear-gradient(var(--border-strong)_1px,transparent_1px),' +
    'linear-gradient(90deg,var(--border-strong)_1px,transparent_1px)] ' +
    '[background-size:40px_40px]',

  // Page wrapper
  pageWrap:
    'relative z-10 min-h-full',
} as const;

// ── Nav items ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: '> home',    path: '/' },
  { label: '> chess',   path: '/game/chess/chess-001' },
  { label: '> sudoku',  path: '/game/sudoku/sudoku-001' },
] as const;

// ── Connection dot ─────────────────────────────────────────────────────────
const STATUS_DOT: Record<ConnectionStatusType, { color: string; pulse: boolean }> = {
  connected:    { color: '#00ff88', pulse: false },
  connecting:   { color: '#ffaa00', pulse: true  },
  reconnecting: { color: '#ffaa00', pulse: true  },
  disconnected: { color: '#ff3366', pulse: false },
};

// ── Component ──────────────────────────────────────────────────────────────
export const RootLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user     = useAuthStore((s) => s.user);

  // Derive connection status from path — real status comes from game hooks
  const connectionStatus: ConnectionStatusType = 'connecting';
  const dot = STATUS_DOT[connectionStatus];

  return (
    <div className={styles.shell}>

      {/* ── Fixed grid background ── */}
      <div className={styles.gridBg} aria-hidden />

      {/* ── Navbar ── */}
      <nav className={styles.nav}>

        {/* Logo */}
        <div
          className={styles.logoWrap}
          onClick={() => navigate('/')}
        >
          <span className={styles.logoBracket}>[</span>
          <span className={styles.logoText}>ft</span>
          <span className={styles.logoDim}>transcendence</span>
          <span className={styles.logoBracket}>]</span>
        </div>

        {/* Nav links */}
        <div className={styles.navLinks}>
          {NAV_ITEMS.map(({ label, path }) => {
            const isActive = location.pathname === path ||
              (path !== '/' && location.pathname.startsWith(path.split('/').slice(0,3).join('/')));
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={[
                  styles.navLink,
                  isActive ? styles.navLinkActive : styles.navLinkInactive,
                ].join(' ')}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Right — status + user */}
        <div className={styles.navRight}>

          {/* Connection status */}
          <div className={styles.statusWrap}>
            <span
              className={[
                styles.statusDot,
                dot.pulse ? 'animate-pulse-ring' : '',
              ].join(' ')}
              style={{ background: dot.color, boxShadow: `0 0 6px ${dot.color}` }}
            />
            <span
              className={styles.statusLabel}
              style={{ color: dot.color }}
            >
              {connectionStatus}
            </span>
          </div>

          {/* User badge */}
          {user ? (
            <div
              className={styles.userWrap}
              onClick={() => navigate(`/profile/${user.username}`)}
              style={{ cursor: 'pointer' }}
            >
              <span style={{ color: '#4a9eca' }}>{user.username}</span>
              <span className={styles.userElo}>{user.elo}</span>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className={styles.navLink + ' ' + styles.navLinkInactive}
            >
              &gt; login
            </button>
          )}

        </div>
      </nav>

      {/* ── Page content ── */}
      <main className={styles.content}>
        <div className={styles.pageWrap}>
          <Outlet />
        </div>
      </main>

    </div>
  );
};
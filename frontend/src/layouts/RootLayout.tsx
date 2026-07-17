import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, useRadarStore } from '@/store';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/Toast';
import { ChatButton } from '@/features/chat/ChatButton';
import type { ConnectionStatusType } from '@/types';
import { useAppearanceRadar } from '@/hooks/useActionCable'; // 📡 1. IMPORTAMOS EL RADAR
import { MatchmakingModal } from '@/components/MatchmakingModal';


const styles = {
  shell: 'min-h-screen bg-bg-base flex flex-col',
  nav:
    'fixed top-0 left-0 right-0 z-50 h-12 ' +
    'flex items-center justify-between px-6 ' +
    'bg-bg-base/95 backdrop-blur-sm ' +
    'border-b border-border-strong',
  logoWrap:
    'flex items-center gap-3 cursor-pointer select-none',
  logoBracket:
    'text-accent font-mono text-sm font-bold',
  logoText:
    'text-text-primary font-mono text-sm font-bold tracking-widest uppercase',
  logoDim:
    'text-white font-mono text-xs',
  navLinks:
    'flex items-center gap-1',
  navLink:
    'px-3 py-1 font-mono text-xs tracking-widest uppercase ' +
    'transition-all duration-base border cursor-pointer',
  navLinkActive:
    'text-accent border-accent-border bg-accent-bg ' +
    'shadow-[0_0_8px_rgba(0,212,255,0.2)]',
  navLinkInactive:
    'text-white border-transparent ' +
    'hover:text-white hover:border-border-strong',
  navLinkDisabled:
    'text-white border-transparent cursor-default',
  navRight:
    'flex items-center gap-4',
  statusWrap:
    'flex items-center gap-2',
  statusDot:
    'relative w-1.5 h-1.5 rounded-full',
  statusLabel:
    'text-[10px] font-mono tracking-widest uppercase',
  userWrap:
    'flex items-center gap-2 px-2 py-1 ' +
    'border border-border-strong ' +
    'font-mono text-xs text-text-secondary cursor-pointer',
  userElo:
    'text-accent',
  content: 'flex-1 pt-12 relative',
  gridBg:
    'fixed inset-0 pointer-events-none opacity-[0.06] z-0 ' +
    '[background-image:linear-gradient(var(--border-strong)_1px,transparent_1px),' +
    'linear-gradient(90deg,var(--border-strong)_1px,transparent_1px)] ' +
    '[background-size:40px_40px]',
  pageWrap: 'relative z-10 min-h-full flex flex-col',
  pageContent: 'flex-1',
} as const;

const NAV_ITEMS = [
  { label: '> home', path: '/' },
  { label: '> spectate', path: '/spectate' },
] as const;

const STATUS_DOT: Record<ConnectionStatusType, { color: string; pulse: boolean }> = {
  connected: { color: '#00ff88', pulse: false },
  connecting: { color: '#ffaa00', pulse: true },
  reconnecting: { color: '#ffaa00', pulse: true },
  disconnected: { color: '#ff3366', pulse: false },
};

export const RootLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // 📡 2. ENCIENDE EL RADAR AQUÍ (Incondicionalmente)
  useAppearanceRadar();

  const connectionStatus = useRadarStore((s) => s.status); 
  const dot = STATUS_DOT[connectionStatus];

  return (
    <div className={styles.shell}>
      <div className={styles.gridBg} aria-hidden />

      <nav className={styles.nav}>
        <div
          className={styles.logoWrap}
          onClick={() => navigate('/')}
        >
          <span className={styles.logoBracket}>[</span>
          <span className={styles.logoText}>ft</span>
          <span className={styles.logoDim}>transcendence</span>
          <span className={styles.logoBracket}>]</span>
        </div>

        <div className={styles.navLinks}>
          {NAV_ITEMS.map(({ label, path }) => {
            const isActive =
              location.pathname === path ||
              (path !== '/' &&
                location.pathname.startsWith(
                  path.split('/').slice(0, 3).join('/')
                ));
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

        <div className={styles.navRight}>
          <div className={styles.statusWrap}>
            <span
              className={[
                styles.statusDot,
                dot.pulse ? 'animate-pulse-ring' : '',
              ].join(' ')}
              style={{
                background: dot.color,
                boxShadow: `0 0 6px ${dot.color}`,
              }}
            />
            <span
              className={styles.statusLabel}
              style={{ color: dot.color }}
            >
              {connectionStatus}
            </span>
          </div>

          {user ? (
            <div
              className={styles.userWrap}
              onClick={() => navigate(`/profile/${user.username}`)}
            >
              <span style={{ color: '#4a9eca' }}>{user.username}</span>
              <span className={styles.userElo}>{user.elo}</span>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className={[styles.navLink, styles.navLinkInactive].join(' ')}
            >
              &gt; login
            </button>
          )}
        </div>
      </nav>

      <main className={styles.content}>
        <div className={styles.pageWrap}>
          <div className={styles.pageContent}>
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>

      <ToastContainer />
      <MatchmakingModal />

      {user && <ChatButton />}
    </div>
  );
};
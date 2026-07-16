import { ConnectionStatus } from './ConnectionStatus';
import type { ConnectionStatusType } from '@/types';
import { useAuthStore } from '@/store';

const styles = {
  nav:
    'fixed top-0 left-0 right-0 z-50 ' +
    'flex items-center justify-between ' +
    'px-6 h-14 ' +
    'bg-bg-base/80 backdrop-blur-md ' +
    'border-b border-border',
  logo:
    'flex items-center gap-2.5 select-none',
  logoMark:
    'w-7 h-7 rounded-lg bg-accent flex items-center justify-center ' +
    'text-white text-xs font-mono font-bold tracking-tight shadow-glow',
  logoText:
    'text-sm font-display font-semibold text-text-primary tracking-tight',
  logoDim:
    'text-text-secondary',
  tabs:
    'flex items-center gap-1 ' +
    'bg-bg-elevated rounded-lg p-1 border border-border',
  tab:
    'px-4 py-1.5 rounded-md text-xs font-mono font-medium ' +
    'transition-all duration-base',
  tabActive:
    'bg-accent text-white shadow-sm',
  tabInactive:
    'text-text-primary',
  right:
    'flex items-center gap-4',
  userBadge:
    'flex items-center gap-2 px-3 py-1.5 ' +
    'bg-bg-elevated rounded-lg border border-border ' +
    'text-xs font-mono text-text-primary',
  eloBadge:
    'text-accent font-medium',
} as const;

interface NavbarProps {
  activeGame:       'chess' | 'sudoku';
  onSelectGame:     (game: 'chess' | 'sudoku') => void;
  connectionStatus?: ConnectionStatusType;
}

export const Navbar = ({
  activeGame,
  onSelectGame,
  connectionStatus = 'connecting',
}: NavbarProps) => {
  const user = useAuthStore((s) => s.user);

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span className={styles.logoMark}>ft</span>
        <span className={styles.logoText}>
          transcendence
          <span className={styles.logoDim}> /games</span>
        </span>
      </div>

      <div className={styles.tabs}>
        {(['chess', 'sudoku'] as const).map((game) => (
          <button
            key={game}
            disabled
            className={[styles.tab, styles.tabInactive].join(' ')}
            style={{ cursor: 'default' }}
          >
            {game === 'chess' ? '♟ Chess' : '⊞ Sudoku'}
          </button>
        ))}
      </div>

      <div className={styles.right}>
        <ConnectionStatus status={connectionStatus} />
        {user && (
          <div className={styles.userBadge}>
            <span>{user.username}</span>
            <span className={styles.eloBadge}>{user.elo}</span>
          </div>
        )}
      </div>
    </nav>
  );
};
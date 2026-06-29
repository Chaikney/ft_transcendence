type AvatarSize = 'sm' | 'md' | 'lg';
type OnlineStatus = 'online' | 'offline' | 'away';

interface AvatarProps {
  username:       string;
  elo?:           number;
  src?:           string;          // optional image URL (42 intra avatar)
  size?:          AvatarSize;
  status?:        OnlineStatus;
  showElo?:       boolean;
  showUsername?:  boolean;
  onClick?:       () => void;
  className?:     string;
}

const SIZE_CONFIG = {
  sm: {
    outer:    'w-7 h-7',
    initials: 'text-[10px]',
    dot:      'w-2 h-2 -bottom-0.5 -right-0.5 border',
    elo:      'text-[9px] px-1.5 py-0',
    username: 'text-[10px]',
  },
  md: {
    outer:    'w-10 h-10',
    initials: 'text-sm',
    dot:      'w-2.5 h-2.5 -bottom-0.5 -right-0.5 border',
    elo:      'text-[10px] px-2 py-0.5',
    username: 'text-xs',
  },
  lg: {
    outer:    'w-14 h-14',
    initials: 'text-lg',
    dot:      'w-3 h-3 -bottom-0.5 -right-0.5 border-2',
    elo:      'text-xs px-2.5 py-1',
    username: 'text-sm',
  },
} as const;

const STATUS_COLORS: Record<OnlineStatus, string> = {
  online:  '#00ff88',
  offline: '#1e4d6b',
  away:    '#ffaa00',
};

const getInitials = (username: string): string => {
  const clean = username.replace(/[^a-zA-Z0-9]/g, '');
  return clean.slice(0, 2).toUpperCase();
};

const AVATAR_COLORS = [
  { bg: 'rgba(0,212,255,0.15)',  border: 'rgba(0,212,255,0.4)',  text: '#00d4ff' },
  { bg: 'rgba(77,124,255,0.15)', border: 'rgba(77,124,255,0.4)', text: '#4d7cff' },
  { bg: 'rgba(0,255,136,0.12)',  border: 'rgba(0,255,136,0.3)',  text: '#00ff88' },
  { bg: 'rgba(255,170,0,0.12)',  border: 'rgba(255,170,0,0.3)',  text: '#ffaa00' },
  { bg: 'rgba(255,51,102,0.12)', border: 'rgba(255,51,102,0.3)', text: '#ff3366' },
] as const;

const getAvatarColor = (username: string) => {
  const hash = username
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const styles = {
  wrapper:
    'flex items-center gap-2.5',

  // Avatar circle
  circle:
    'relative flex items-center justify-center ' +
    'font-mono font-bold border flex-shrink-0 ' +
    'overflow-hidden select-none',

  // Image
  img:
    'w-full h-full object-cover',

  // Online dot
  dot:
    'absolute rounded-full border-bg-base',

  // Info column
  info:
    'flex flex-col gap-0.5',

  // ELO badge
  eloBadge:
    'inline-flex items-center font-mono font-medium border ' +
    'tracking-widest leading-none',
} as const;

export const Avatar = ({
  username,
  elo,
  src,
  size         = 'md',
  status,
  showElo      = false,
  showUsername = false,
  onClick,
  className    = '',
}: AvatarProps) => {
  const sz    = SIZE_CONFIG[size];
  const color = getAvatarColor(username);
  const showInfo = showElo || showUsername;

  return (
    <div
      className={[
        styles.wrapper,
        onClick && 'cursor-pointer',
        className,
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick
        ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick()
        : undefined
      }
    >
      {/* Avatar circle */}
      <div
        className={[styles.circle, sz.outer].join(' ')}
        style={{
          background:  color.bg,
          borderColor: color.border,
          color:       color.text,
        }}
      >
        {src ? (
          <img
            src={src}
            alt={username}
            className={styles.img}
            onError={(e) => {
              // Fallback to initials on image error
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className={sz.initials}>
            {getInitials(username)}
          </span>
        )}

        {/* Status dot */}
        {status && (
          <span
            className={[styles.dot, sz.dot].join(' ')}
            style={{
              background: STATUS_COLORS[status],
              boxShadow:  `0 0 4px ${STATUS_COLORS[status]}`,
            }}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>

      {/* Info column */}
      {showInfo && (
        <div className={styles.info}>
          {showUsername && (
            <span
              className={[sz.username, 'font-mono text-text-primary'].join(' ')}
            >
              {username}
            </span>
          )}

          {showElo && elo !== undefined && (
            <span
              className={[styles.eloBadge, sz.elo].join(' ')}
              style={{
                color:       '#00d4ff',
                background:  'rgba(0,212,255,0.08)',
                borderColor: 'rgba(0,212,255,0.25)',
              }}
            >
              {elo}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

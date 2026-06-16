import type { ConnectionStatusType } from '../features/chess/types';

// ── Styles (separated from logic) ──────────────────────────────────────────
const styles = {
  wrapper: 'flex items-center gap-2',
  label:   'text-xs font-mono tracking-wide',
  dot:     'relative flex items-center justify-center w-2 h-2',
  dotCore: 'w-2 h-2 rounded-full',
  dotRing: 'absolute w-3.5 h-3.5 rounded-full opacity-30 animate-pulse-ring',
} as const;

type StatusConfig = {
  label:    string;
  dotColor: string;
  ringColor: string;
  textColor: string;
  pulse:    boolean;
};

const STATUS_CONFIG: Record<ConnectionStatusType, StatusConfig> = {
  connected: {
    label:     'Connected',
    dotColor:  'bg-status-success',
    ringColor: 'bg-status-success',
    textColor: 'text-status-success',
    pulse:     false,
  },
  connecting: {
    label:     'Connecting...',
    dotColor:  'bg-status-warning',
    ringColor: 'bg-status-warning',
    textColor: 'text-text-secondary',
    pulse:     true,
  },
  reconnecting: {
    label:     'Reconnecting...',
    dotColor:  'bg-status-warning',
    ringColor: 'bg-status-warning',
    textColor: 'text-text-secondary',
    pulse:     true,
  },
  disconnected: {
    label:     'Disconnected',
    dotColor:  'bg-status-error',
    ringColor: 'bg-status-error',
    textColor: 'text-status-error',
    pulse:     false,
  },
};


interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

export const ConnectionStatus = ({ status }: ConnectionStatusProps) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['disconnected'];
  const { label, dotColor, ringColor, textColor, pulse } = config;

  return (
    <div
      data-testid="connection-status"
      className={styles.wrapper}
    >
      {/* Dot with optional pulse ring */}
      <span className={styles.dot}>
        <span className={[styles.dotCore, dotColor].join(' ')} />
        {pulse && (
          <span className={[styles.dotRing, ringColor].join(' ')} />
        )}
      </span>

      {/* Label */}
      <span className={[styles.label, textColor].join(' ')}>
        {label}
      </span>
    </div>
  );
};

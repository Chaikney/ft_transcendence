type Status = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

const STATUS_CONFIG: Record<Status, { label: string; color: string; pulse: boolean }> = {
  connecting:    { label: 'Connecting...',  color: 'bg-yellow-400', pulse: true  },
  connected:     { label: 'Connected',      color: 'bg-green-400',  pulse: false },
  disconnected:  { label: 'Disconnected',   color: 'bg-red-500',    pulse: false },
  reconnecting:  { label: 'Reconnecting...', color: 'bg-yellow-400', pulse: true },
};

interface ConnectionStatusProps {
  status: Status;
}

export const ConnectionStatus = ({ status }: ConnectionStatusProps) => {
  const { label, color, pulse } = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
      <span
        className={[
          'w-2 h-2 rounded-full',
          color,
          pulse ? 'animate-pulse' : '',
        ].join(' ')}
      />
      {label}
    </div>
  );
};
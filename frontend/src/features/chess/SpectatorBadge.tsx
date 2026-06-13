const styles = {
  wrap:
    'flex items-center gap-2 px-2.5 py-1 font-mono text-[10px] ' +
    'border tracking-widest uppercase',
  dot:
    'w-1.5 h-1.5 rounded-full animate-pulse-ring',
  count:
    'tabular-nums',
} as const;

interface SpectatorBadgeProps {
  count: number;
}

export const SpectatorBadge = ({ count }: SpectatorBadgeProps) => (
  <div
    className={styles.wrap}
    style={{
      color:       '#ffaa00',
      background:  'rgba(255, 170, 0, 0.06)',
      borderColor: 'rgba(255, 170, 0, 0.25)',
    }}
    aria-label={`${count} spectator${count !== 1 ? 's' : ''} watching`}
  >
    <span
      className={styles.dot}
      style={{
        background: '#ffaa00',
        boxShadow:  '0 0 4px #ffaa00',
      }}
    />
    <span className={styles.count}>
      {count} watching
    </span>
  </div>
);

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  page: 'fixed inset-0 flex flex-col items-center justify-center bg-bg-base gap-4 z-50',
  pageSpinner:
    'w-10 h-10 rounded-full border-2 border-border border-t-accent animate-spin-slow',
  pageLabel: 'text-sm font-mono text-text-secondary tracking-widest uppercase animate-pulse',

  inline: 'flex items-center justify-center gap-3 py-8',
  inlineSpinner:
    'w-6 h-6 rounded-full border-2 border-border border-t-accent animate-spin-slow',
  inlineLabel: 'text-sm font-mono text-text-secondary',

  boardSkeleton:
    'rounded-lg skeleton',

  block: 'skeleton rounded-md',
} as const;

// ── Page loader ────────────────────────────────────────────────────────────
interface PageLoaderProps {
  label?: string;
}

export const PageLoader = ({ label = 'Loading...' }: PageLoaderProps) => (
  <div className={styles.page} role="status" aria-live="polite">
    <span className={styles.pageSpinner} />
    <span className={styles.pageLabel}>{label}</span>
  </div>
);

// ── Inline loader ──────────────────────────────────────────────────────────
interface InlineLoaderProps {
  label?: string;
}

export const InlineLoader = ({ label = 'Loading game...' }: InlineLoaderProps) => (
  <div className={styles.inline} role="status" aria-live="polite">
    <span className={styles.inlineSpinner} />
    <span className={styles.inlineLabel}>{label}</span>
  </div>
);

// ── Board skeleton ─────────────────────────────────────────────────────────
export const BoardSkeleton = () => (
  <div
    className={styles.boardSkeleton}
    style={{ width: 'min(80vw, 480px)', height: 'min(80vw, 480px)' }}
    role="status"
    aria-label="Loading board..."
  />
);

// ── Generic skeleton block ─────────────────────────────────────────────────
interface SkeletonProps {
  width?:  string;
  height?: string;
  className?: string;
}

export const Skeleton = ({ width = '100%', height = '1rem', className = '' }: SkeletonProps) => (
  <div
    className={[styles.block, className].join(' ')}
    style={{ width, height }}
    role="status"
    aria-label="Loading..."
  />
);
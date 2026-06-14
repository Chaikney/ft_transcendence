import type { ReactNode } from 'react';

type StatusVariant = 'active' | 'warning' | 'error' | 'muted';

interface TerminalCardProps {
  children:     ReactNode;
  title?:       string; 
  status?:      string;
  statusVariant?: StatusVariant;
  maxWidth?:    string;
  padding?:     string;
  className?:   string;
  noBrackets?:  boolean;
  noGlow?:      boolean;
  onClick?:     () => void;
}

const STATUS_COLORS: Record<StatusVariant, string> = {
  active:  '#00ff88',
  warning: '#ffaa00',
  error:   '#ff3366',
  muted:   '#1e4d6b',
};

const styles = {
  base:
    'relative bg-bg-surface border border-border-strong ' +
    'transition-all duration-base',

  glow:
    'shadow-[0_0_8px_rgba(0,212,255,0.12),inset_0_0_60px_rgba(0,212,255,0.02)]',

  innerGradient:
    'absolute inset-0 pointer-events-none ' +
    'bg-gradient-to-br from-[rgba(0,212,255,0.02)] ' +
    'via-transparent to-[rgba(77,124,255,0.01)]',

  bracketTL:
    'absolute top-[-1px] left-[-1px] w-3 h-3 ' +
    'border-t-2 border-l-2 border-accent pointer-events-none',
  bracketBR:
    'absolute bottom-[-1px] right-[-1px] w-3 h-3 ' +
    'border-b-2 border-r-2 border-accent pointer-events-none',

  header:
    'flex items-center gap-2 px-4 py-2 border-b border-border-strong',
  headerDot:
    'w-2 h-2 rounded-full flex-shrink-0',
  headerTitle:
    'text-[10px] font-mono tracking-[0.15em] uppercase text-text-muted flex-1 ' +
    'truncate',
  headerStatus:
    'text-[10px] font-mono tracking-widest flex-shrink-0',
} as const;

const DOTS = ['#ff3366', '#ffaa00', '#00ff88'] as const;

export const TerminalCard = ({
  children,
  title,
  status,
  statusVariant = 'muted',
  maxWidth      = 'max-w-3xl',
  padding       = 'p-8',
  className     = '',
  noBrackets    = false,
  noGlow        = false,
  onClick,
}: TerminalCardProps) => {
  const showHeader = title !== undefined || status !== undefined;

  const wrapperClasses = [
    styles.base,
    !noGlow && styles.glow,
    maxWidth,
    'w-full',
    onClick && 'cursor-pointer',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={wrapperClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick
        ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick()
        : undefined
      }
    >
      <div className={styles.innerGradient} aria-hidden />

      {!noBrackets && (
        <>
          <span className={styles.bracketTL} aria-hidden />
          <span className={styles.bracketBR} aria-hidden />
        </>
      )}

      {showHeader && (
        <div className={styles.header}>
          {DOTS.map((color) => (
            <span
              key={color}
              className={styles.headerDot}
              style={{ background: color }}
            />
          ))}

          {title && (
            <span className={styles.headerTitle}>{title}</span>
          )}

          {status && (
            <span
              className={styles.headerStatus}
              style={{ color: STATUS_COLORS[statusVariant] }}
            >
              {status}
            </span>
          )}
        </div>
      )}

      <div className={padding}>
        {children}
      </div>
    </div>
  );
};
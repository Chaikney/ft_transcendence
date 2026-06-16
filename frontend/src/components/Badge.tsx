import type { ReactNode } from 'react';

type BadgeVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'accent'
  | 'muted'
  | 'online'
  | 'offline';

interface BadgeProps {
  children:  ReactNode;
  variant?:  BadgeVariant;
  dot?:      boolean;
  pulse?:    boolean;
  size?:     'sm' | 'md';
  className?: string;
}

// ── Variant styles (inline — bypasses Tailwind v4 dynamic class issue) ─────
type VariantStyle = {
  color:      string;
  background: string;
  border:     string;
  dotColor:   string;
};

const VARIANTS: Record<BadgeVariant, VariantStyle> = {
  success: {
    color:      '#00ff88',
    background: 'rgba(0, 255, 136, 0.08)',
    border:     'rgba(0, 255, 136, 0.25)',
    dotColor:   '#00ff88',
  },
  warning: {
    color:      '#ffaa00',
    background: 'rgba(255, 170, 0, 0.08)',
    border:     'rgba(255, 170, 0, 0.25)',
    dotColor:   '#ffaa00',
  },
  error: {
    color:      '#ff3366',
    background: 'rgba(255, 51, 102, 0.08)',
    border:     'rgba(255, 51, 102, 0.25)',
    dotColor:   '#ff3366',
  },
  info: {
    color:      '#4a9eca',
    background: 'rgba(74, 158, 202, 0.08)',
    border:     'rgba(74, 158, 202, 0.25)',
    dotColor:   '#4a9eca',
  },
  accent: {
    color:      '#00d4ff',
    background: 'rgba(0, 212, 255, 0.08)',
    border:     'rgba(0, 212, 255, 0.25)',
    dotColor:   '#00d4ff',
  },
  muted: {
    color:      '#4a9eca',
    background: 'rgba(13, 45, 74, 0.6)',
    border:     '#0d2d4a',
    dotColor:   '#1e4d6b',
  },
  online: {
    color:      '#00ff88',
    background: 'rgba(0, 255, 136, 0.06)',
    border:     'rgba(0, 255, 136, 0.20)',
    dotColor:   '#00ff88',
  },
  offline: {
    color:      '#1e4d6b',
    background: 'rgba(13, 29, 45, 0.6)',
    border:     '#0d2d4a',
    dotColor:   '#1e4d6b',
  },
};

const SIZE = {
  sm: { padding: '1px 6px',  fontSize: '9px',  dotSize: '5px' },
  md: { padding: '2px 10px', fontSize: '10px', dotSize: '6px' },
};

export const Badge = ({
  children,
  variant   = 'muted',
  dot       = false,
  pulse     = false,
  size      = 'md',
  className = '',
}: BadgeProps) => {
  const v = VARIANTS[variant];
  const s = SIZE[size];

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-mono font-medium ' +
        'tracking-widest uppercase border rounded-none',
        className,
      ].join(' ')}
      style={{
        color:      v.color,
        background: v.background,
        borderColor: v.border,
        padding:    s.padding,
        fontSize:   s.fontSize,
        letterSpacing: '0.08em',
      }}
    >
      {dot && (
        <span
          className={pulse ? 'animate-pulse-ring' : ''}
          style={{
            display:      'inline-block',
            width:        s.dotSize,
            height:       s.dotSize,
            borderRadius: '50%',
            background:   v.dotColor,
            boxShadow:    `0 0 4px ${v.dotColor}`,
            flexShrink:   0,
          }}
        />
      )}
      {children}
    </span>
  );
};

import type { ButtonHTMLAttributes, ReactNode } from 'react';

// ── Styles ─────────────────────────────────────────────────────────────────
const base =
  'inline-flex items-center justify-center gap-2 font-display font-medium ' +
  'rounded-md transition-all duration-base select-none ' +
  'disabled:opacity-40 disabled:cursor-not-allowed ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base';

const variants = {
  primary:
    'bg-accent hover:bg-accent-hover active:scale-[0.97] text-white ' +
    'border border-accent-border px-4 py-2 text-sm',
  secondary:
    'bg-bg-elevated hover:bg-bg-overlay active:scale-[0.97] text-text-primary ' +
    'border border-border px-4 py-2 text-sm',
  ghost:
    'bg-transparent hover:bg-bg-elevated active:scale-[0.97] text-text-secondary hover:text-text-primary ' +
    'border border-transparent hover:border-border px-4 py-2 text-sm',
  danger:
    'bg-status-error-bg hover:bg-status-error/20 active:scale-[0.97] text-status-error ' +
    'border border-status-error/30 px-4 py-2 text-sm',
} as const;

const sizes = {
  sm: 'text-xs px-3 py-1.5 rounded-md',
  md: 'text-sm px-4 py-2 rounded-md',
  lg: 'text-base px-5 py-2.5 rounded-lg',
} as const;

// ── Types ──────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?:    keyof typeof sizes;
  loading?: boolean;
  icon?:    ReactNode;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────
export const Button = ({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const classes = [base, variants[variant], sizes[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin-slow" />
      ) : icon ? (
        <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
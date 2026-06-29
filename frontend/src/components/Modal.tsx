import { useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface ModalAction {
  label:    string;
  onClick:  () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

interface ModalProps {
  open:       boolean;
  onClose:    () => void;
  title?:     string;
  status?:    string;
  children:   ReactNode;
  actions?:   ModalAction[];
  maxWidth?:  string;
  closable?:  boolean;
}

const styles = {
  backdrop:
    'fixed inset-0 z-[1000] flex items-center justify-center px-4 ' +
    'bg-black/80 backdrop-blur-sm',

  card:
    'relative w-full bg-bg-surface border border-border-strong ' +
    'shadow-[0_0_40px_rgba(0,212,255,0.15),0_0_0_1px_rgba(0,212,255,0.1)] ' +
    'animate-fade-in',

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
    'text-[10px] font-mono tracking-[0.15em] uppercase text-text-muted flex-1',
  headerClose:
    'text-text-muted hover:text-accent font-mono text-sm ' +
    'transition-colors duration-base cursor-pointer px-1 flex-shrink-0',

  body:
    'p-5',

  footer:
    'flex items-center justify-end gap-3 px-5 pb-5',

  scanlines:
    'absolute inset-0 pointer-events-none opacity-20 ' +
    '[background:repeating-linear-gradient(0deg,transparent,transparent_2px,' +
    'rgba(0,212,255,0.03)_2px,rgba(0,212,255,0.03)_4px)]',
} as const;

const DOTS = ['#ff3366', '#ffaa00', '#00ff88'] as const;

export const Modal = ({
  open,
  onClose,
  title,
  status,
  children,
  actions   = [],
  maxWidth  = 'max-w-md',
  closable  = true,
}: ModalProps) => {

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) onClose();
    },
    [closable, onClose]
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, handleKey]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && closable) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={[styles.card, maxWidth, 'w-full'].join(' ')}>

        <div className={styles.scanlines} aria-hidden />

        <span className={styles.bracketTL} aria-hidden />
        <span className={styles.bracketBR} aria-hidden />

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
              className="text-[10px] font-mono tracking-widest mr-2"
              style={{ color: '#ffaa00' }}
            >
              {status}
            </span>
          )}

          {closable && (
            <span
              className={styles.headerClose}
              onClick={onClose}
              role="button"
              aria-label="Close modal"
              tabIndex={0}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && onClose()
              }
            >
              ✕
            </span>
          )}
        </div>

        <div className={styles.body}>{children}</div>

        {actions.length > 0 && (
          <div className={styles.footer}>
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant ?? 'secondary'}
                size="sm"
                onClick={action.onClick}
                loading={action.loading}
              >
                &gt; {action.label}
              </Button>
            ))}
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};

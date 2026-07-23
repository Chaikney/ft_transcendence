import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id:        string;
  message:   string;
  variant:   ToastVariant;
  duration?: number; 
  title?:    string;
  size?:     'sm' | 'lg';
}

interface ToastStore {
  toasts: Toast[];
  add:    (toast: Omit<Toast, 'id'>) => string;
  remove: (id: string) => void;
  clear:  () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set(() => ({
      toasts: [{ ...toast, id }],
    }));
    return id;
  },

  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clear: () => set({ toasts: [] }),
}));

// ── Hook — convenience API ─────────────────────────────────────────────────
export const useToast = () => {
  const { add, remove, clear } = useToastStore();

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info', options?: Partial<Pick<Toast, 'title' | 'duration' | 'size'>>) =>
      add({ message, variant, ...options }),
    [add]
  );

  return {
    toast,
    success: (msg: string, title?: string) => toast(msg, 'success', { title }),
    error:   (msg: string, title?: string, size?: 'sm' | 'lg') => toast(msg, 'error', { title, duration: 6000, size }),
    warning: (msg: string, title?: string) => toast(msg, 'warning', { title }),
    info:    (msg: string, title?: string) => toast(msg, 'info',    { title }),
    remove,
    clear,
  };
};

const VARIANT_CONFIG: Record<ToastVariant, {
  icon:        string;
  color:       string;
  bg:          string;
  border:      string;
  barColor:    string;
}> = {
  success: {
    icon:     '✓',
    color:    '#00ff88',
    bg:       'rgba(0, 255, 136, 0.06)',
    border:   'rgba(0, 255, 136, 0.25)',
    barColor: '#00ff88',
  },
  error: {
    icon:     '✕',
    color:    '#ff3366',
    bg:       'rgba(255, 51, 102, 0.06)',
    border:   'rgba(255, 51, 102, 0.25)',
    barColor: '#ff3366',
  },
  warning: {
    icon:     '⚠',
    color:    '#ffaa00',
    bg:       'rgba(255, 170, 0, 0.06)',
    border:   'rgba(255, 170, 0, 0.25)',
    barColor: '#ffaa00',
  },
  info: {
    icon:     'i',
    color:    '#00d4ff',
    bg:       'rgba(0, 212, 255, 0.06)',
    border:   'rgba(0, 212, 255, 0.25)',
    barColor: '#00d4ff',
  },
};

interface ToastItemProps {
  toast:    Toast;
  onRemove: (id: string) => void;
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
  const config   = VARIANT_CONFIG[toast.variant];
  const duration = toast.duration ?? 4000;

  const isLarge = toast.size === 'lg';

  // Auto-dismiss
  useEffect(() => {
    if (duration === 0) return;
    const t = setTimeout(() => onRemove(toast.id), duration);
    return () => clearTimeout(t);
  }, [toast.id, duration, onRemove]);

  return (
    <div
      className="relative flex items-start gap-3 px-4 py-3 font-mono text-xs animate-fade-in"
      style={{
        background:  config.bg,
        border:      `1px solid ${config.border}`,
        boxShadow:   `0 0 12px ${config.border}, 0 4px 16px rgba(0,0,0,0.6)`,
        minWidth:    isLarge ? '100px' : '280px',
        maxWidth:    isLarge ? '500px' : '300px',
        fontSize:    isLarge ? '8px' : '12px',
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Bracket corner TL */}
      <span
        className="absolute top-[-1px] left-[-1px] w-2.5 h-2.5 pointer-events-none"
        style={{
          borderTop:  `2px solid ${config.color}`,
          borderLeft: `2px solid ${config.color}`,
        }}
        aria-hidden
      />
      {/* Bracket corner BR */}
      <span
        className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 pointer-events-none"
        style={{
          borderBottom: `2px solid ${config.color}`,
          borderRight:  `2px solid ${config.color}`,
        }}
        aria-hidden
      />

      {/* Icon */}
      <span
        className="w-5 h-5 flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5"
        style={{
          color:       config.color,
          textShadow:  `0 0 6px ${config.color}`,
        }}
      >
        {config.icon}
      </span>

      {/* Content */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        {toast.title && (
          <span
            className="font-bold tracking-widest uppercase text-[10px]"
            style={{ color: config.color }}
          >
            {toast.title}
          </span>
        )}
        <span
          className="leading-relaxed"
          style={{ color: '#c8e8ff' }}
        >
          {toast.message}
        </span>
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-[10px] transition-colors duration-base ml-1 mt-0.5"
        style={{ color: '#1e4d6b' }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = config.color)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = '#1e4d6b')
        }
        aria-label="Dismiss notification"
      >
        ✕
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div
          className="absolute bottom-0 left-0 h-[2px]"
          style={{
            background: config.barColor,
            animation:  `toast-progress ${duration}ms linear forwards`,
            opacity:    0.6,
          }}
        />
      )}
    </div>
  );
};

// ── Toast container — rendered via portal ─────────────────────────────────
export const ToastContainer = () => {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return createPortal(
    <>
      {/* Progress bar keyframe — injected once */}
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      <div
        className="fixed z-[2000] flex flex-col gap-2 pointer-events-none"
        style={{
          top:  '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          maxHeight: 'calc(100vh - 48px)',
          overflow: 'hidden',
        }}
        aria-label="Notifications"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </>,
    document.body
  );
};

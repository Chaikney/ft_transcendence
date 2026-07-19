import { Button } from './Button';
import { useNavigate } from "react-router-dom";

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  wrapper:
    'flex flex-col items-center justify-center gap-4 py-12 px-6 ' +
    'text-center animate-fade-in',
  iconWrapper:
    'w-12 h-12 rounded-xl bg-status-error-bg border border-status-error/20 ' +
    'flex items-center justify-center',
  icon: 'text-status-error text-xl',
  title: 'text-base font-display font-medium text-text-primary',
  message: 'text-sm font-mono text-text-secondary max-w-xs leading-relaxed',
} as const;

interface ErrorMessageProps {
  title?:   string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({
  title   = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorMessageProps) => {
  // 🚀 AHORA SÍ: El hook está dentro del componente
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper} role="alert">
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>✕</span>
      </div>

      <div className="flex flex-col gap-1">
        <p className={styles.title}>{title}</p>
        <p className={styles.message}>{message}</p>
      </div>

      {onRetry && (
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
          Go Home
        </Button>
      )}
    </div>
  );
};
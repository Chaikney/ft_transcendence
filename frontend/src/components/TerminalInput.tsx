import type { InputHTMLAttributes } from 'react';

interface TerminalInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?:       string;
  error?:       string;
  hint?:        string;
  prefix?:      string;
  success?:     boolean;
}

const styles = {
  wrapper:
    'flex flex-col gap-1.5 w-full',

  label:
    'text-[10px] font-mono tracking-[0.15em] uppercase text-text-muted',

  inputRow:
    'flex items-center ' +
    'border bg-bg-base ' +
    'transition-all duration-base ' +
    'focus-within:border-accent ' +
    'focus-within:shadow-[0_0_8px_rgba(0,212,255,0.2)]',

  prefix:
    'px-3 font-mono text-sm text-accent select-none flex-shrink-0 ' +
    'border-r border-border',

  input:
    'flex-1 px-3 py-2 bg-transparent font-mono text-sm ' +
    'text-text-primary placeholder:text-text-muted ' +
    'outline-none caret-accent ' +
    'disabled:opacity-30 disabled:cursor-not-allowed',

  hint:
    'text-[10px] font-mono text-text-muted',

  error:
    'text-[10px] font-mono text-[#ff3366]',

  successIcon:
    'px-3 text-[#00ff88] text-xs font-mono flex-shrink-0',
} as const;

export const TerminalInput = ({
  label,
  error,
  hint,
  prefix,
  success,
  className = '',
  id,
  ...inputProps
}: TerminalInputProps) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  const borderColor = error
    ? '#ff3366'
    : success
    ? '#00ff88'
    : '#1a5f8a';

  const boxShadow = error
    ? '0 0 6px rgba(255,51,102,0.15)'
    : success
    ? '0 0 6px rgba(0,255,136,0.15)'
    : undefined;

  return (
    <div className={[styles.wrapper, className].join(' ')}>

      {label && (
        <label
          htmlFor={inputId}
          className={styles.label}
        >
          &gt; {label}:
        </label>
      )}

      {/* Input row */}
      <div
        className={styles.inputRow}
        style={{ borderColor, boxShadow }}
      >
        {prefix && (
          <span className={styles.prefix}>{prefix}</span>
        )}

        <input
          id={inputId}
          className={styles.input}
          {...inputProps}
        />

        {success && !error && (
          <span className={styles.successIcon}>OK</span>
        )}
      </div>

      {error && (
        <span className={styles.error}>
          // error: {error}
        </span>
      )}

      {hint && !error && (
        <span className={styles.hint}>
          // {hint}
        </span>
      )}

    </div>
  );
};
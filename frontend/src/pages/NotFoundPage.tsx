import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const GLITCH_FRAMES = ['4O4', '404', '4_4', '404', '40!', '404'];

// ── Styles ────────────────────────────────────────────────────────────────
const styles = {
  page:
    'min-h-screen flex flex-col items-center justify-center ' +
    'px-6 gap-8',

  card:
    'w-full max-w-lg terminal-card bracket-corners p-6 ' +
    'flex flex-col gap-6',

  cardHeader:
    'flex items-center gap-2 pb-3 border-b border-border-strong',
  headerDot:
    'w-2 h-2 rounded-full',
  headerTitle:
    'text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted flex-1',
  headerCode:
    'text-[10px] font-mono text-[#ff3366] tracking-widest',

  // Giant 404
  glitchWrap:
    'flex flex-col items-center gap-2',
  glitchNum:
    'text-7xl font-mono font-bold tracking-tight select-none',
  glitchSub:
    'text-xs font-mono text-text-muted tracking-[0.2em] uppercase',

  // Terminal log
  logWrap:
    'flex flex-col gap-1.5 p-3 border border-border bg-bg-base ' +
    'font-mono text-xs',
  logLine:
    'flex items-center gap-2',
  logErr:
    'text-[#ff3366] text-[10px] font-bold w-5 text-right shrink-0',
  logText:
    'text-text-secondary',

  // Actions
  actionRow:
    'flex items-center gap-3',
  btnPrimary:
    'px-4 py-2 font-mono text-xs tracking-widest uppercase border-2 ' +
    'border-accent text-accent bg-accent-bg cursor-pointer ' +
    'transition-all duration-base ' +
    'hover:bg-accent hover:text-bg-base ' +
    'hover:shadow-[0_0_12px_rgba(0,212,255,0.3)]',
  btnSecondary:
    'px-4 py-2 font-mono text-xs tracking-widest uppercase border ' +
    'border-border-strong text-text-muted cursor-pointer ' +
    'transition-all duration-base ' +
    'hover:border-accent-border hover:text-text-secondary',
} as const;

// ── Component ──────────────────────────────────────────────────────────────
export const NotFoundPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [frame, setFrame] = useState(0);

  // Glitch animation on mount
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setFrame(i % GLITCH_FRAMES.length);
      i++;
      if (i >= GLITCH_FRAMES.length * 2) clearInterval(t);
    }, 80);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Header */}
        <div className={styles.cardHeader}>
          <span className={styles.headerDot} style={{ background: '#ff3366' }} />
          <span className={styles.headerDot} style={{ background: '#ffaa00' }} />
          <span className={styles.headerDot} style={{ background: '#00ff88' }} />
          <span className={styles.headerTitle}>
            router.ts — path not found
          </span>
          <span className={styles.headerCode}>ERR_404</span>
        </div>

        {/* Glitch 404 */}
        <div className={styles.glitchWrap}>
          <span
            className={styles.glitchNum}
            style={{
              color: frame % 2 === 0 ? '#ff3366' : '#00d4ff',
              textShadow: frame % 2 === 0
                ? '2px 0 0 rgba(0,212,255,0.6), -2px 0 0 rgba(255,51,102,0.6)'
                : '0 0 12px rgba(0,212,255,0.5)',
              transition: 'color 40ms, text-shadow 40ms',
            }}
          >
            {GLITCH_FRAMES[frame]}
          </span>
          <span className={styles.glitchSub}>
            page_not_found
          </span>
        </div>

        {/* Log */}
        <div className={styles.logWrap}>
          {[
            { tag: 'ERR', text: `> path "${location.pathname}" does not exist` },
            { tag: 'ERR', text: '> no matching route in router/index.tsx' },
            { tag: 'INF', text: '> suggestion: check the URL or navigate home' },
          ].map(({ tag, text }, i) => (
            <div key={i} className={styles.logLine}>
              <span
                className={styles.logErr}
                style={{ color: tag === 'ERR' ? '#ff3366' : '#4a9eca' }}
              >
                {tag}
              </span>
              <span className={styles.logText}>{text}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className={styles.actionRow}>
          <button
            className={styles.btnPrimary}
            onClick={() => navigate('/')}
          >
            &gt; go_home()
          </button>
          <button
            className={styles.btnSecondary}
            onClick={() => navigate(-1)}
          >
            &gt; go_back()
          </button>
        </div>

      </div>
    </div>
  );
};
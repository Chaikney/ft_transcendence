/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {

      /* ── Colors wired to CSS variables ── */
      colors: {
        bg: {
          base:     'var(--bg-base)',
          surface:  'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          overlay:  'var(--bg-overlay)',
        },
        border: {
          DEFAULT: 'var(--border)',
          subtle:  'var(--border-subtle)',
          strong:  'var(--border-strong)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
          inverse:   'var(--text-inverse)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          dim:     'var(--accent-dim)',
          hover:   'var(--accent-hover)',
          bg:      'var(--accent-bg)',
          border:  'var(--accent-border)',
        },
        status: {
          success:      'var(--status-success)',
          'success-bg': 'var(--status-success-bg)',
          warning:      'var(--status-warning)',
          'warning-bg': 'var(--status-warning-bg)',
          error:        'var(--status-error)',
          'error-bg':   'var(--status-error-bg)',
          info:         'var(--status-info)',
          'info-bg':    'var(--status-info-bg)',
        },
        chess: {
          light:    'var(--chess-light)',
          dark:     'var(--chess-dark)',
          selected: 'var(--chess-selected)',
          lastmove: 'var(--chess-lastmove)',
          border:   'var(--chess-border)',
          coord:    'var(--chess-coord)',
        },
        sudoku: {
          cell:     'var(--sudoku-cell-bg)',
          selected: 'var(--sudoku-selected-bg)',
          locked:   'var(--sudoku-locked-text)',
          input:    'var(--sudoku-input-text)',
          error:    'var(--sudoku-error-text)',
          border:   'var(--sudoku-border)',
          'border-box': 'var(--sudoku-border-box)',
        },
      },

      /* ── Font families ── */
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },

      /* ── Border radii ── */
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        '2xl':'var(--radius-2xl)',
      },

      /* ── Box shadows ── */
      boxShadow: {
        sm:    'var(--shadow-sm)',
        md:    'var(--shadow-md)',
        lg:    'var(--shadow-lg)',
        glow:  'var(--shadow-glow)',
        board: 'var(--shadow-board)',
      },

      /* ── Transitions ── */
      transitionDuration: {
        fast: '80ms',
        base: '160ms',
        slow: '280ms',
      },

      /* ── Animations ── */
      animation: {
        'fade-in':      'fadeIn 280ms ease both',
        'board-reveal': 'board-reveal 350ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer':      'shimmer 1.6s infinite',
        'pulse-ring':   'pulse-ring 1.4s ease-in-out infinite',
        'spin-slow':    'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'board-reveal': {
          from: { opacity: '0', transform: 'scale(0.97) translateY(12px)' },
          to:   { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-ring': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },

      /* ── Spacing extras ── */
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
    },
  },
  plugins: [],
};
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { useToast } from '@/components/Toast';
import { createSudokuGame } from '@/features/sudoku/service';
import { useMatchmaking } from '@/hooks/useActionCable';
import { LeaderboardTable } from '@/features/leaderboard/LeaderboardTable';

const BOOT_LINES = [
  '> INITIALIZING transcendence v2.0...',
  '> LOADING game modules............. OK',
  '> CONNECTING to server............. PENDING',
  '> AUTH module...................... READY',
  '> CHESS engine..................... LOADED',
  '> SUDOKU engine.................... LOADED',
  '> SYSTEM STATUS.................... ONLINE',
];

const GAMES = [
  {
    id:       'chess',
    label:    'CHESS',
    path:     '/game/chess/chess-001', // Esto ahora solo sirve como referencia visual o de reserva
    icon:     '♟',
    desc:     'Two-player chess or play VS IA. Real-time via WebSocket.',
    tag:      'MULTIPLAYER / AI',
    status:   'ONLINE',
    lines:    ['> board: 8x8', '> engine: rails/core', '> mode: pvp | pve'],
  },
  {
    id: 'sudoku',
    label: 'SUDOKU',
    icon: '⊞',
    desc: 'Logic puzzle. Three difficulty levels. Keyboard supported.',
    tag: 'SINGLE PLAYER',
    status: 'ONLINE',
    lines: ['> grid: 9x9', '> difficulty: easy|medium|hard', '> input: keyboard|pad'],
  },
] as const;

const styles: Record<string, string> = {
  page: 'min-h-screen flex flex-col items-center justify-center px-6 py-16 gap-12',
  terminal: 'w-full max-w-2xl terminal-card bracket-corners p-4 font-mono text-xs',
  terminalHeader: 'flex items-center gap-2 mb-3 pb-2 border-b border-border-strong',
  terminalDot: 'w-2 h-2 rounded-full',
  terminalTitle: 'text-text-muted tracking-widest uppercase text-[10px] flex-1',
  terminalLine: 'text-text-secondary leading-6',
  terminalAccent: 'text-accent',
  terminalCursor: 'inline-block w-2 h-4 bg-accent animate-blink ml-1 align-middle',
  heroWrap: 'text-center flex flex-col items-center gap-3',
  heroEyebrow: 'text-[10px] font-mono tracking-[0.3em] uppercase text-text-muted',
  heroTitle: 'text-4xl font-mono font-bold tracking-tight text-text-primary leading-none',
  heroGlow: 'text-accent animate-flicker',
  heroSub: 'text-sm font-mono text-text-secondary max-w-md leading-relaxed',
  cardsWrap: 'w-full max-w-2xl grid grid-cols-1 gap-4 sm:grid-cols-2',
  card: 'terminal-card bracket-corners p-5 cursor-pointer transition-all duration-base group hover:border-accent hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]',
  cardHeader: 'flex items-center justify-between mb-3',
  cardIcon: 'text-3xl group-hover:animate-flicker transition-all',
  cardTag: 'text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 border',
  cardLabel: 'text-base font-mono font-bold tracking-widest uppercase text-text-primary group-hover:text-accent transition-colors',
  cardDesc: 'text-xs font-mono text-text-muted leading-relaxed mb-3',
  cardLines: 'flex flex-col gap-0.5',
  cardLine: 'text-[10px] font-mono text-text-muted',
  cardLineAccent: 'text-accent',
  cardFooter: 'flex items-center justify-between mt-4 pt-3 border-t border-border',
  cardStatus: 'flex items-center gap-1.5',
  cardStatusDot: 'w-1.5 h-1.5 rounded-full bg-[#00ff88]',
  cardStatusText: 'text-[10px] font-mono text-[#00ff88] tracking-widest',
  cardCta: 'text-[10px] font-mono text-text-muted group-hover:text-accent transition-colors tracking-widest',
  authPrompt: 'flex flex-col items-center gap-2',
  authText: 'text-xs font-mono text-text-muted',
  authLink: 'text-accent font-mono text-xs cursor-pointer hover:text-accent-hover underline underline-offset-2 tracking-widest uppercase',
};

export const LandingPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isMock          = import.meta.env.VITE_USE_MOCK === 'true';
  const { success } = useToast();
  
  // <-- 2. INSTANCIAMOS EL MATCHMAKING
  const { joinQueue } = useMatchmaking(); 

  const [visibleLines, setVisibleLines] = useState(0);
  const [booted, setBooted] = useState(true);

  const handleGameSelect = async (gameId: 'chess' | 'sudoku') => {
    if (!isAuthenticated && !isMock) {
      navigate('/login');
      return;
    }

    if (gameId === 'chess') {
      joinQueue(gameId);
    } else if (gameId === 'sudoku') {
      try {
        const res = await createSudokuGame('easy');
        const newGame = (res as any); 
        if (newGame?.id) {
          navigate(`/game/sudoku/sudoku-${String(newGame.id).padStart(3, '0')}`);
        }
      } catch (err) {
        console.error("Failed to launch sudoku:", err);
      }
    }
  };

  return (
    <div className={styles.page}>
      {/* TARJETA TERMINAL CON RANKING */}
      <div className={styles.terminal}>
        <div className={styles.terminalHeader}>
          <span className={styles.terminalDot} style={{ background: '#ff3366' }} />
          <span className={styles.terminalDot} style={{ background: '#ffaa00' }} />
          <span className={styles.terminalDot} style={{ background: '#00ff88' }} />
          <span className={styles.terminalTitle}>transcendence — TOP 10 -- global rankings</span>
        </div>
        
        {/* Aquí renderizamos el ranking real */}
        <LeaderboardTable />
      </div>

      {booted && (
        <div className={styles.heroWrap + ' animate-fade-in'}>
          <span className={styles.heroEyebrow}>welcome to</span>
          <h1 className={styles.heroTitle}><span className={styles.heroGlow}>transcendence</span></h1>
          <p className={styles.heroSub}>Multiplayer gaming platform. Chess and Sudoku. Real-time WebSocket sync. Built on Rails + React.</p>
        </div>
      )}

      {booted && (
        <div className={styles.cardsWrap + ' animate-fade-in'}>
          {GAMES.map((game) => (
            <div
                key={game.id}
                className={styles.card}
                onClick={() => handleGameSelect(game.id as 'chess' | 'sudoku')}
                style={{ borderColor: '#1a5f8a' }}
              >
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>{game.icon}</span>
                <span className={styles.cardTag} style={{ color: '#4a9eca', borderColor: '#0d2d4a', background: 'rgba(0,212,255,0.04)' }}>{game.tag}</span>
              </div>
              <div className={styles.cardLabel}>{game.label}</div>
              <div className={styles.cardDesc}>{game.desc}</div>
              <div className={styles.cardLines}>
                {game.lines.map((line, i) => {
                  const [cmd, val] = line.split(': ');
                  return (
                    <span key={i} className={styles.cardLine}>
                      <span className={styles.cardLineAccent}>{cmd}: </span>{val}
                    </span>
                  );
                })}
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.cardStatus}>
                  <span className={styles.cardStatusDot} />
                  <span className={styles.cardStatusText}>{game.status}</span>
                </div>
                <span className={styles.cardCta}>&gt; launch_game() _</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
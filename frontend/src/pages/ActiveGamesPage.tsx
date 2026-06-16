import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TerminalCard } from '@/components/TerminalCard';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { InlineLoader } from '@/components';

interface LiveGame {
  id:          string;
  type:        'chess' | 'sudoku';
  white:       string;
  black:       string;
  status:      'active' | 'checkmate' | 'draw';
  turn:        'white' | 'black';
  move_count:  number;
  spectators:  number;
  started_at:  string;
}

const MOCK_GAMES: LiveGame[] = [
  {
    id:         'chess-001',
    type:       'chess',
    white:      'mdiaz-or',
    black:      'jlopez',
    status:     'active',
    turn:       'white',
    move_count: 14,
    spectators: 3,
    started_at: '5 min ago',
  },
  {
    id:         'chess-002',
    type:       'chess',
    white:      'agarcia',
    black:      'rperez',
    status:     'active',
    turn:       'black',
    move_count: 28,
    spectators: 7,
    started_at: '12 min ago',
  },
  {
    id:         'chess-003',
    type:       'chess',
    white:      'msmith',
    black:      'CPU',
    status:     'active',
    turn:       'white',
    move_count: 6,
    spectators: 1,
    started_at: '1 min ago',
  },
];

const styles = {
  page:
    'min-h-screen flex flex-col items-center px-6 py-12 gap-8',

  header:
    'w-full max-w-2xl flex flex-col gap-2',
  eyebrow:
    'text-[10px] font-mono tracking-[0.3em] uppercase text-text-muted',
  title:
    'text-2xl font-mono font-bold text-text-primary tracking-tight',
  titleAccent:
    'text-accent',
  subtitle:
    'text-xs font-mono text-text-muted',

  list:
    'w-full max-w-2xl flex flex-col gap-3',

  gameRow:
    'flex flex-col gap-3 cursor-pointer transition-all duration-base',

  gameHeader:
    'flex items-center justify-between',
  gameId:
    'text-[10px] font-mono text-text-muted tracking-widest',
  gameTime:
    'text-[10px] font-mono text-text-muted',

  players:
    'flex items-center gap-2 font-mono text-sm',
  playerWhite:
    'text-[#f0d9b5]',
  playerBlack:
    'text-[#c8e8ff]',
  vs:
    'text-text-muted text-xs',

  statsRow:
    'flex items-center gap-3 flex-wrap',
  stat:
    'text-[10px] font-mono text-text-muted',
  statVal:
    'text-text-secondary',

  actionRow:
    'flex items-center justify-between mt-1',

  empty:
    'w-full max-w-2xl text-center',
  emptyText:
    'text-xs font-mono text-text-muted',
  emptyBlink:
    'animate-blink text-accent',
} as const;

export const ActiveGamesPage = () => {
  const navigate = useNavigate();
  const isMock   = import.meta.env.VITE_USE_MOCK === 'true';

  const [games,   setGames]   = useState<LiveGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (isMock) {
          // Simulate network delay
          await new Promise((r) => setTimeout(r, 600));
          setGames(MOCK_GAMES);
        } else {
          // Real: GET /api/v1/games/active
          const { get } = await import('@/services/api');
          const res = await get<LiveGame[]>('/games/active');
          setGames(res.data);
        }
      } catch {
        setGames([]);
      } finally {
        setLoading(false);
      }
    };
    load();

    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.eyebrow}>// spectator.active_games</span>
        <h1 className={styles.title}>
          <span className={styles.titleAccent}>&gt; </span>
          Live Games
        </h1>
        <p className={styles.subtitle}>
          // {games.length} game{games.length !== 1 ? 's' : ''} in progress — refreshes every 15s
        </p>
      </div>

      {/* Games list */}
      {loading ? (
        <InlineLoader label="Fetching live games..." />
      ) : games.length === 0 ? (
        <div className={styles.empty}>
          <TerminalCard
            title="active_games — no results"
            maxWidth="max-w-2xl"
            padding="p-8"
          >
            <p className={styles.emptyText}>
              // no games currently in progress
              <span className={styles.emptyBlink}> _</span>
            </p>
          </TerminalCard>
        </div>
      ) : (
        <div className={styles.list}>
          {games.map((game) => (
            <TerminalCard
              key={game.id}
              title={`game_${game.id} — ${game.type}`}
              status="LIVE"
              statusVariant="active"
              maxWidth="max-w-2xl"
              padding="p-4"
              onClick={() => navigate(`/spectate/${game.id}`)}
            >
              <div className={styles.gameRow}>

                {/* Players */}
                <div className={styles.gameHeader}>
                  <div className={styles.players}>
                    <span className={styles.playerWhite}>{game.white}</span>
                    <span className={styles.vs}>vs</span>
                    <span className={styles.playerBlack}>{game.black}</span>
                  </div>
                  <Badge
                    variant={game.turn === 'white' ? 'muted' : 'muted'}
                    dot
                    size="sm"
                  >
                    {game.turn}&apos;s turn
                  </Badge>
                </div>

                {/* Stats */}
                <div className={styles.statsRow}>
                  <span className={styles.stat}>
                    moves: <span className={styles.statVal}>{game.move_count}</span>
                  </span>
                  <span className={styles.stat}>
                    started: <span className={styles.statVal}>{game.started_at}</span>
                  </span>
                  <span className={styles.stat}>
                    <span
                      style={{ color: '#ffaa00' }}
                    >
                      {game.spectators} watching
                    </span>
                  </span>
                </div>

                {/* Action */}
                <div className={styles.actionRow}>
                  <span
                    className="text-[10px] font-mono text-text-muted"
                  >
                    &gt; click to spectate
                  </span>
                  <Button variant="ghost" size="sm">
                    &gt; watch()
                  </Button>
                </div>

              </div>
            </TerminalCard>
          ))}
        </div>
      )}

    </div>
  );
};

import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ChessBoard } from '@/features/chess/ChessBoard';
import { SpectatorBadge } from '@/features/chess/SpectatorBadge';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { InlineLoader } from '@/components';
import { TerminalCard } from '@/components/TerminalCard';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useSpectatorChannel } from '@/features/chess/hooks/useSpectatorChannel';
import { useMatchStore } from '@/store';
import { useToast } from '@/components/Toast';

const styles = {
  page:
    'min-h-screen flex flex-col items-center justify-center ' +
    'px-4 py-8 gap-6',

  topBar:
    'flex items-center justify-between w-full max-w-[560px] flex-wrap gap-2',

  topBarLeft:
    'flex items-center gap-3',

  topBarRight:
    'flex items-center gap-3',

  spectatorLabel:
    'text-[10px] font-mono text-text-muted tracking-widest uppercase',

  gameId:
    'text-xs font-mono text-text-muted tracking-widest truncate',

  moveLog:
    'w-full flex flex-col gap-1',
  moveLogTitle:
    'text-[10px] font-mono text-text-muted tracking-widest uppercase mb-1',
  moveEntry:
    'flex items-center gap-3 text-[10px] font-mono text-text-secondary',
  moveNumber:
    'text-text-muted w-6 text-right flex-shrink-0',
  moveFrom:
    'text-accent',
  moveArrow:
    'text-text-muted',
  moveTo:
    'text-accent',
  movePiece:
    'text-text-secondary',
  moveTime:
    'text-text-muted ml-auto',
    
  playerRow:
    'flex items-center justify-between w-full',
  playerInfo:
    'flex items-center gap-2',
  playerDot:
    'w-3 h-3 rounded-full border border-black/20 flex-shrink-0',
  playerName:
    'text-xs font-mono text-text-secondary',
  playerTurn:
    'text-xs font-mono text-accent animate-pulse',
} as const;

// ── MOCK move history (replace with real from API) ─────────────────────────
const MOCK_MOVES = [
  { n: 1,  from: 'e2', to: 'e4',  piece: 'P', time: '0:12' },
  { n: 1,  from: 'e7', to: 'e5',  piece: 'p', time: '0:23' },
  { n: 2,  from: 'g1', to: 'f3',  piece: 'N', time: '0:35' },
  { n: 2,  from: 'b8', to: 'c6',  piece: 'n', time: '0:47' },
  { n: 3,  from: 'f1', to: 'c4',  piece: 'B', time: '1:02' },
];

export const SpectatorPage = () => {
  const { id: gameId } = useParams<{ id: string }>();
  const navigate       = useNavigate();
  const { success, info } = useToast();

  if (!gameId) return <Navigate to="/" replace />;

  const isMock = import.meta.env.VITE_USE_MOCK === 'true';

  // ── Mock mode: load game from store directly ───────────────────────────
  const chessGame  = useMatchStore((s) => s.chessGame);
  const setChessGame = useMatchStore((s) => s.setChessGame);
  const resetMatch   = useMatchStore((s) => s.resetMatch);

  // ── Real mode: subscribe to SpectatorChannel ───────────────────────────
  const { connectionStatus, spectatorCount, lastEvent } =
    useSpectatorChannel(isMock ? null : gameId);

  // Load mock data in dev
  useEffect(() => {
    if (!isMock) return;
    import('@/mocks').then(({ mockChessGameAfterMove }) => {
      setChessGame(mockChessGameAfterMove);
    });
  }, [isMock]);

  // Toast on player events
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === 'player_connected')
      info(`${lastEvent.player ?? 'Player'} reconnected`);
    if (lastEvent.type === 'player_disconnected')
      info(`${lastEvent.player ?? 'Player'} disconnected`);
    if (lastEvent.type === 'game_over')
      success('Game over', lastEvent.status ?? 'Match ended');
  }, [lastEvent]);

  // Cleanup on unmount
  useEffect(() => () => { resetMatch(); }, []);

  // ── Render ─────────────────────────────────────────────────────────────
  if (!chessGame) {
    return (
      <div className={styles.page}>
        <InlineLoader label="Loading game..." />
      </div>
    );
  }

  const isWhiteTurn = chessGame.turn === 'white';

  return (
    <div className={styles.page}>

      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <ConnectionStatus status={isMock ? 'connected' : connectionStatus} />
          <span className={styles.spectatorLabel}>spectating</span>
          <Badge variant="warning" dot pulse>
            {isMock ? '3' : spectatorCount} watching
          </Badge>
        </div>
        <div className={styles.topBarRight}>
          <span className={styles.gameId}>#{gameId}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            &gt; leave
          </Button>
        </div>
      </div>

      {/* Main board card */}
      <TerminalCard
        title={`spectator — game_${gameId}`}
        status={chessGame.status === 'active' ? 'LIVE' : chessGame.status.toUpperCase()}
        statusVariant={chessGame.status === 'active' ? 'active' : 'error'}
        maxWidth="max-w-[560px]"
      >
        <div className="flex flex-col gap-5">

          {/* Black player row */}
          <div className={styles.playerRow}>
            <div className={styles.playerInfo}>
              <span
                className={styles.playerDot}
                style={{ background: '#1a1a2e', borderColor: '#353a56' }}
              />
              <span className={styles.playerName}>black_player</span>
            </div>
            {!isWhiteTurn && chessGame.status === 'active' && (
              <span className={styles.playerTurn}>▶ thinking...</span>
            )}
          </div>

          {/* Board — fully disabled, read-only */}
          <ChessBoard
            gameState={chessGame}
            onMove={() => {}} // no-op — spectators cannot move
            disabled={true}
          />

          {/* White player row */}
          <div className={styles.playerRow}>
            <div className={styles.playerInfo}>
              <span
                className={styles.playerDot}
                style={{ background: '#f0d9b5', borderColor: '#b58863' }}
              />
              <span className={styles.playerName}>white_player</span>
            </div>
            {isWhiteTurn && chessGame.status === 'active' && (
              <span className={styles.playerTurn}>▶ thinking...</span>
            )}
          </div>

          {/* Last move indicator */}
          {chessGame.last_move && (
            <div
              className="flex items-center gap-2 px-3 py-2 font-mono text-xs border"
              style={{
                background:  'rgba(0,212,255,0.04)',
                borderColor: 'rgba(0,212,255,0.15)',
                color:       '#4a9eca',
              }}
            >
              <span style={{ color: '#1e4d6b' }}>&gt; last_move:</span>
              <span style={{ color: '#00d4ff' }}>{chessGame.last_move.from}</span>
              <span style={{ color: '#1e4d6b' }}>→</span>
              <span style={{ color: '#00d4ff' }}>{chessGame.last_move.to}</span>
              <span style={{ color: '#4a9eca', marginLeft: 'auto' }}>
                {chessGame.last_move.piece}
              </span>
            </div>
          )}

        </div>
      </TerminalCard>

      {/* Move log */}
      <TerminalCard
        title="move_log[]"
        status={`${MOCK_MOVES.length} moves`}
        statusVariant="muted"
        maxWidth="max-w-[560px]"
        padding="p-4"
      >
        <div className={styles.moveLog}>
          {MOCK_MOVES.map((move, i) => (
            <div key={i} className={styles.moveEntry}>
              <span className={styles.moveNumber}>{move.n}.</span>
              <span className={styles.moveFrom}>{move.from}</span>
              <span className={styles.moveArrow}>→</span>
              <span className={styles.moveTo}>{move.to}</span>
              <span className={styles.movePiece}>{move.piece}</span>
              <span className={styles.moveTime}>{move.time}</span>
            </div>
          ))}
          {chessGame.last_move && (
            <div className={styles.moveEntry}>
              <span className={styles.moveNumber}>
                {MOCK_MOVES.length + 1}.
              </span>
              <span className={styles.moveFrom}>
                {chessGame.last_move.from}
              </span>
              <span className={styles.moveArrow}>→</span>
              <span className={styles.moveTo}>
                {chessGame.last_move.to}
              </span>
              <span className={styles.movePiece}>
                {chessGame.last_move.piece}
              </span>
              <span
                className={styles.moveTime}
                style={{ color: '#00ff88' }}
              >
                live
              </span>
            </div>
          )}
        </div>
      </TerminalCard>

    </div>
  );
};
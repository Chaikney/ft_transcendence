import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import { ChessBoard } from '@/features/chess/ChessBoard';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { InlineLoader } from '@/components';
import { TerminalCard } from '@/components/TerminalCard';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useGameSocket } from '@/hooks/useGameSocket';
import { useGameStore } from '@/store/useGameStore';
import { gameService } from '@/services/gameService';

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

  spectatorCount:
    'text-[10px] font-mono tracking-widest',
  spectatorCountVal:
    'text-[#ffaa00]',

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

export const SpectatorPage = () => {
  const { id: gameId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. Estados globales
  const { gameData, setGameData, updateGameData, setLoading, isLoading } = useGameStore();

  // 2. Conexión en tiempo real
  // IMPORTANTE: useCallback con [] evita que esta función se recree en cada
  // render. Si se recrea, useGameSocket la ve como una prop nueva, vuelve a
  // suscribirse al canal, eso dispara un nuevo broadcast de spectator_count,
  // lo que provoca otro render... bucle infinito de subscribe/unsubscribe.
  const handleSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'move_updated':
        updateGameData({
          fen: data.game.fen,
          turn: data.game.turn,
          status: data.game.status,
          last_move: data.game.last_move
        });
        break;
      case 'game_over':
        updateGameData({ status: data.status });
        break;
      case 'spectator_count':
        updateGameData({ spectators: data.count });
        break;
      case 'opponent_disconnect':
        console.log("El oponente se desconectó");
        break;
    }
  }, [updateGameData]);

  useGameSocket(gameId ? `chess-${gameId}` : null, handleSocketMessage);

  // 3. Carga inicial
  useEffect(() => {
    const loadGame = async () => {
      if (!gameId) return;
      setLoading(true);
      try {
        const data = await gameService.fetchGame(gameId);
        setGameData(data);
      } catch (err) {
        console.error("Error cargando partida:", err);
      } finally {
        setLoading(false);
      }
    };
    loadGame();
  }, [gameId, setGameData, setLoading]);

  if (isLoading || !gameData) {
    return (
      <div className={styles.page}>
        <InlineLoader label="Cargando tablero..." />
      </div>
    );
  }

  const isWhiteTurn = gameData.turn === 'white';

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <ConnectionStatus status="connected" />
          <span className={styles.spectatorLabel}>spectating</span>
          <Badge variant="warning" dot pulse>LIVE</Badge>
        </div>
        <div className={styles.topBarRight}>
          <span className={styles.spectatorCount}>
            <span className={styles.spectatorCountVal}>{gameData.spectators}</span> watching
          </span>
          <span className={styles.gameId}>#{gameId}</span>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            &gt; leave
          </Button>
        </div>
      </div>

      <TerminalCard
        title={`spectator — game_${gameId}`}
        status={gameData.status === 'active' ? 'LIVE' : gameData.status.toUpperCase()}
        statusVariant={gameData.status === 'active' ? 'active' : 'error'}
        maxWidth="max-w-[560px]"
      >
        <div className="flex flex-col gap-5">
          <div className={styles.playerRow}>
            <div className={styles.playerInfo}>
              <span className={styles.playerDot} style={{ background: '#1a1a2e' }} />
              <span className={styles.playerName}>{gameData.black}</span>
            </div>
            {!isWhiteTurn && gameData.status === 'active' && <span className={styles.playerTurn}>▶ thinking...</span>}
          </div>

          <ChessBoard 
            gameState={gameData}
            onMove={() => {}}
            onDraw={() => {}}
            disabled={true}
          />
          <div className={styles.playerRow}>
            <div className={styles.playerInfo}>
              <span className={styles.playerDot} style={{ background: '#f0d9b5' }} />
              <span className={styles.playerName}>{gameData.white}</span>
            </div>
            {isWhiteTurn && gameData.status === 'active' && <span className={styles.playerTurn}>▶ thinking...</span>}
          </div>
        </div>
      </TerminalCard>
    </div>
  );
};
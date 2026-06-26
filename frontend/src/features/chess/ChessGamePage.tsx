import { useParams, Navigate } from 'react-router-dom';
import { ChessBoard } from './ChessBoard';
import { useChessGame } from './hooks/useChessGame';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { InlineLoader, Button } from '@/components';
import { TerminalCard } from '@/components/TerminalCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useMatchStore, useAuthStore } from '@/store'; 
import { LobbyScreen } from '@/components/LobbyScreen'; 

const styles = {
  page: 'min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6',
  topBar: 'flex items-center justify-between w-full max-w-[520px]',
  gameId: 'text-xs font-mono text-text-muted tracking-widest truncate',
  actionRow: 'flex items-center justify-center gap-3 w-full',
} as const;

export const ChessGamePage = () => {
  const { id: gameId } = useParams<{ id: string }>();

  if (!gameId) return <Navigate to="/" replace />;

  const { chessGame, sendMove, requestAIMove, connectionStatus, sendReady } = useChessGame(gameId);

  const status = useMatchStore((s) => s.status); 
  const error = useMatchStore((s) => s.error);
  const resetMatch = useMatchStore((s) => s.resetMatch);
  
  const currentUser = useAuthStore((s) => s.user);

  const isLocked = connectionStatus !== 'connected';

  console.log("DEBUG: Renderizando ChessGamePage");
  console.log("DEBUG: ID de partida:", gameId);
  console.log("DEBUG: Estado actual del match:", status);

  if (status === 'lobby') {
    return <LobbyScreen onAccept={sendReady} />;
  }

  if (error) {
    return (
      <div className={styles.page}>
        <ErrorMessage title="Failed to load game" message={error} onRetry={resetMatch} />
      </div>
    );
  }

  if (!chessGame) {
    return (
      <div className={styles.page}>
        <InlineLoader label="Connecting to game..." />
      </div>
    );
  }

  // 🥷 FIX: Forzamos a que sean números para evitar el error 1 !== "1"
  // 🛑 AÑADE ESTO:
  const p1 = Number(chessGame.player1_id);
  const p2 = Number(chessGame.player2_id);
  const me = Number(currentUser?.id);

  // Si p2 es 0 o NaN (no llegó), por defecto es Blancas ('w')
  // Si me es igual a p2, soy Negras ('b')
  const localColor = (p2 !== 0 && me === p2) ? 'b' : 'w';

  console.log("DEBUG: Player IDs:", { p1, p2, me, localColor });
  

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <ConnectionStatus status={connectionStatus} />
        <span className={styles.gameId}>#{gameId}</span>
      </div>

      <TerminalCard
        title={`chess — game_${gameId}`}
        status={chessGame.status.toUpperCase()}
        statusVariant={chessGame.status === 'active' ? 'active' : 'error'}
        maxWidth="max-w-[560px]"
      >
        <div className="flex flex-col items-center gap-5">
          <ChessBoard
            gameState={chessGame}
            onMove={sendMove}
            disabled={isLocked}
            localPlayerColor={localColor} 
          />
          <div className={styles.actionRow}>
            <Button variant="primary" onClick={requestAIMove} disabled={isLocked || chessGame.status !== 'active'}>
              Request AI move
            </Button>
            <Button variant="ghost" size="sm" onClick={resetMatch}>
              New game
            </Button>
          </div>
        </div>
      </TerminalCard>
    </div>
  );
};
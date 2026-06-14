import { useParams, Navigate } from 'react-router-dom';
import { ChessBoard } from './ChessBoard';
import { useChessGame } from './hooks/useChessGame';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { InlineLoader, Button } from '@/components';
import { TerminalCard } from '@/components/TerminalCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useMatchStore } from '@/store';

const styles = {
  page:
    'min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6',
  topBar:
    'flex items-center justify-between w-full max-w-[520px]',
  gameId:
    'text-xs font-mono text-text-muted tracking-widest truncate',
  actionRow:
    'flex items-center justify-center gap-3 w-full',
} as const;

export const ChessGamePage = () => {
  // ── Fix: read gameId from URL params ──────────────────────────────────
  const { id: gameId } = useParams<{ id: string }>();

  if (!gameId) return <Navigate to="/" replace />;

  const { chessGame, sendMove, requestAIMove, connectionStatus } =
    useChessGame(gameId);

  const error      = useMatchStore((s) => s.error);
  const resetMatch = useMatchStore((s) => s.resetMatch);

  const isMock   = import.meta.env.VITE_USE_MOCK === 'true';
  const isLocked = !isMock && connectionStatus !== 'connected';

  if (error) {
    return (
      <div className={styles.page}>
        <ErrorMessage
          title="Failed to load game"
          message={error}
          onRetry={resetMatch}
        />
      </div>
    );
  }

  if (!chessGame) {
    return (
      <div className={styles.page}>
        <InlineLoader label="Loading game..." />
      </div>
    );
  }

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
          />
          <div className={styles.actionRow}>
            <Button
              variant="primary"
              onClick={requestAIMove}
              disabled={isLocked || chessGame.status !== 'active'}
            >
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

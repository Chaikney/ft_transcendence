import { ChessBoard } from "./ChessBoard";
import { useChessGame } from "./hooks/useChessGame";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { InlineLoader, ErrorMessage, Button } from '@/components';
import { useMatchStore } from '@/store';

const styles = {
  page:
    'min-h-screen bg-bg-base flex flex-col items-center justify-center ' +
    'px-4 py-8 gap-6',
  topBar:
    'flex items-center justify-between w-full max-w-[480px]',
  gameId:
    'text-xs font-mono text-text-muted tracking-widest truncate',
  boardCard:
    'flex flex-col items-center gap-5 w-full max-w-[520px] ' +
    'bg-bg-surface rounded-2xl border border-border ' +
    'p-6 shadow-lg animate-fade-in',
  actionRow:
    'flex items-center justify-center gap-3 w-full',
  secondaryActions:
    'flex items-center gap-2',
} as const;

interface ChessGamePageProps {
  gameId: string;
}

export const ChessGamePage = ({ gameId }: ChessGamePageProps) => {
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

      <div className={styles.boardCard}>
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
          <div className={styles.secondaryActions}>
            <Button variant="ghost" size="sm" onClick={resetMatch}>
              New game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


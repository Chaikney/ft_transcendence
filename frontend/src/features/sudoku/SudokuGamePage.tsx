import { useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { SudokuBoard } from './SudokuBoard';
import { useSudokuGame } from './hooks/useSudokuGame';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { InlineLoader, Button } from '@/components';
import { TerminalCard } from '@/components/TerminalCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Badge } from '@/components/Badge';
import { useMatchStore } from '@/store';

const styles = {
  page:
    'min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6',
  topBar:
    'flex items-center justify-between w-full max-w-[500px]',
  gameId:
    'text-xs font-mono text-text-muted tracking-widest truncate',
  actionRow:
    'flex items-center justify-center gap-3 w-full',
  hintText:
    'text-xs font-mono text-text-muted text-center',
} as const;

export const SudokuGamePage = () => {
  // ── Fix: read gameId from URL params ──────────────────────────────────
  const { id } = useParams<{ id: string }>();
  const gameId = id || "1"; // Forzamos el ID "1" que es el que existe en tu BD

  if (!gameId) return <Navigate to="/" replace />;

  const { sudokuGame, sendMove, connectionStatus } = useSudokuGame(gameId);

  const error      = useMatchStore((s) => s.error);
  const resetMatch = useMatchStore((s) => s.resetMatch);

  const originalGridRef = useRef<number[][] | null>(null);
  if (sudokuGame && !originalGridRef.current) {
    originalGridRef.current = sudokuGame.grid.map((row) => [...row]);
  }

  const isMock   = import.meta.env.VITE_USE_MOCK === 'true';
  const isLocked = !isMock && connectionStatus !== 'connected';

  if (error) {
    return (
      <div className={styles.page}>
        <ErrorMessage
          title="Failed to load puzzle"
          message={error}
          onRetry={resetMatch}
        />
      </div>
    );
  }

  if (!sudokuGame || !originalGridRef.current) {
    return (
      <div className={styles.page}>
        <InlineLoader label="Loading puzzle..." />
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
        title={`sudoku — game_${gameId}`}
        status={sudokuGame.status.toUpperCase()}
        statusVariant={
          sudokuGame.status === 'won'  ? 'active'  :
          sudokuGame.status === 'lost' ? 'error'   : 'warning'
        }
        maxWidth="max-w-[540px]"
      >
        <div className="flex flex-col items-center gap-5">

          {/* Difficulty badge */}
          <Badge variant="accent" dot>
            {sudokuGame.difficulty}
          </Badge>

          <SudokuBoard
            gameState={sudokuGame}
            originalGrid={originalGridRef.current}
            onMove={sendMove}
            disabled={isLocked}
          />

          {!isLocked && sudokuGame.status === 'active' && (
            <p className={styles.hintText}>
              Click a cell, then type 1–9 or use the pad
            </p>
          )}

          <div className={styles.actionRow}>
            <Button variant="ghost" size="sm" onClick={resetMatch}>
              New puzzle
            </Button>
          </div>
        </div>
      </TerminalCard>
    </div>
  );
};

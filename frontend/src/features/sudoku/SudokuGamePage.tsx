import { useRef, useCallback } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { SudokuBoard } from './SudokuBoard';
import { useSudokuGame } from './hooks/useSudokuGame';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { InlineLoader, Button } from '@/components';
import { TerminalCard } from '@/components/TerminalCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Badge } from '@/components/Badge';
import { useMatchStore } from '@/store';
import { createSudokuGame } from './service';

const styles = {
  page:      'min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6',
  topBar:    'flex items-center justify-between w-full max-w-[500px]',
  gameId:    'text-xs font-mono text-text-muted tracking-widest truncate',
  actionRow: 'flex items-center justify-center gap-3 w-full',
  hintText:  'text-xs font-mono text-text-muted text-center',
} as const;

export const SudokuGamePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const gameId = id;

  const { sudokuGame, sendMove, connectionStatus } = useSudokuGame(gameId || '');

  const error      = useMatchStore((s) => s.error);
  const resetMatch = useMatchStore((s) => s.resetMatch);

  const originalGridRef = useRef<number[][] | null>(null);
  const creating        = useRef(false);

  if (sudokuGame && !originalGridRef.current) {
    originalGridRef.current = sudokuGame.grid.map((row) => [...row]);
  }

  const isMock   = import.meta.env.VITE_USE_MOCK === 'true';
  const isLocked = !isMock && connectionStatus !== 'connected';

  const handleNewPuzzle = useCallback(async () => {
    if (creating.current) return;
    creating.current = true;
    try {
      resetMatch();
      originalGridRef.current = null;
      const res = await createSudokuGame('easy');
      const newGame = res as unknown as { id: number };
      navigate(`/game/sudoku/sudoku-${String(newGame.id).padStart(3, '0')}`);
    } catch (err) {
      console.error('Failed to create new puzzle:', err);
    } finally {
      creating.current = false;
    }
  }, [resetMatch, navigate]);

  if (!gameId) {
    return (
      <div className={styles.page}>
        <p className="text-white">No game selected.</p>
        <Button onClick={handleNewPuzzle}>Create New Game</Button>
      </div>
    );
  }

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
            <Button variant="ghost" size="sm" onClick={handleNewPuzzle}>
              New puzzle
            </Button>
          </div>
        </div>
      </TerminalCard>
    </div>
  );
};
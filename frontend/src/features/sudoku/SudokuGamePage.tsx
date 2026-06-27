import { useRef, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SudokuBoard } from './SudokuBoard';
import { useSudokuGame } from './hooks/useSudokuGame';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { InlineLoader, Button } from '@/components';
import { TerminalCard } from '@/components/TerminalCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Badge } from '@/components/Badge';
import { useMatchStore } from '@/store';
import { createSudokuGame } from './service';
import type { SudokuDifficulty } from './types';

const styles = {
  page:      'min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6',
  topBar:    'flex items-center justify-between w-full max-w-[500px]',
  gameId:    'text-xs font-mono text-text-muted tracking-widest truncate',
  actionRow: 'relative flex items-center justify-center gap-3 w-full',
  hintText:  'text-xs font-mono text-text-muted text-center',
} as const;

export const SudokuGamePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const gameId = id;

  const [showDifficulty, setShowDifficulty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { sudokuGame, sendMove, connectionStatus } = useSudokuGame(gameId || '');

  const error      = useMatchStore((s) => s.error);
  const resetMatch = useMatchStore((s) => s.resetMatch);

  const originalGridRef = useRef<number[][] | null>(null);

  if (sudokuGame && !originalGridRef.current) {
    originalGridRef.current = sudokuGame.grid.map((row) => [...row]);
  }

  const isMock   = import.meta.env.VITE_USE_MOCK === 'true';
  const isLocked = !isMock && connectionStatus !== 'connected';

  const handleNewPuzzle = useCallback(async (difficulty: SudokuDifficulty = 'easy') => {
    if (isLoading) return;
    setIsLoading(true);
    setShowDifficulty(false);
    try {
      resetMatch();
      originalGridRef.current = null;
      const res = await createSudokuGame(difficulty);
      const newGame = res as unknown as { id: number };
      navigate(`/game/sudoku/sudoku-${String(newGame.id).padStart(3, '0')}`);
    } catch (err) {
      console.error('Failed to create new puzzle:', err);
      setIsLoading(false);
    } 
  }, [resetMatch, navigate]);

  if (!gameId) {
    return (
      <div className={styles.page}>
        <p className="text-white">No game selected.</p>
        <Button onClick={() => handleNewPuzzle('easy')}>Create New Game</Button>
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
            {gameId && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => navigate('/sudoku')}
              >
                Abandon game
              </Button>
            )}

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDifficulty(!showDifficulty)}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'New puzzle'} {showDifficulty ? '▲' : '▼'}
              </Button>

              {showDifficulty && (
                <div className="absolute bottom-full mb-2 flex flex-col bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl z-50 overflow-hidden min-w-[120px]">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      disabled={isLoading}
                      onClick={() => handleNewPuzzle(level)}
                      className="px-4 py-2 text-xs text-text-secondary hover:text-white hover:bg-[#2a2a2a] capitalize transition-colors text-left flex items-center justify-between"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </TerminalCard>
    </div>
  );
};
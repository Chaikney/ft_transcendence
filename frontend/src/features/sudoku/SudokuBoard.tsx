import { useEffect, useCallback } from "react";
import { useSudokuBoard } from './hooks/useSudokuBoard'
import type { SudokuGameState, SudokuMovePayload } from "./types";

interface SudokuBoardProps {
	gameState: SudokuGameState;
	originalGrid: number[][];
	onMove: (payload: SudokuMovePayload) => void;
	disabled?: boolean;
}

// returns Tailwind classes for each cell based on its state
const getCellClasses = (
	row: number,
	col: number,
	isSelected: boolean,
	isLocked: boolean,
	isSameRow: boolean,
	isSameCol: boolean,
	isSameBox: boolean,
	value: number
): string => {
	const base = 'relative flex items-center justify-center text-lg font-mono select-none transition-colors duration-100 cursor-pointer';

	const border = [
    	'border border-gray-300',
    	col % 3 === 0 && col !== 0 ? 'border-l-2 border-l-gray-600' : '',
    	row % 3 === 0 && row !== 0 ? 'border-t-2 border-t-gray-600' : '',
  	].filter(Boolean).join(' ');

	const bg = isSelected
		? 'bg-blue-400'
		: (isSameRow || isSameCol || isSameBox)
		? 'bg-blue-50'
		: 'bg-white';

  	const text = isLocked
  	  ? 'text-gray-800 font-bold cursor-default'
  	  : value !== 0
  	  ? 'text-blue-600'
  	  : 'text-transparent';

  return [base, border, bg, text].join(' ');
};

export const SudokuBoard = ({
  gameState,
  originalGrid,
  onMove,
  disabled = false,
}: SudokuBoardProps) => {
  if (!gameState || !originalGrid || !gameState.grid) {
    return <div>Loading game...</div>
  }
  const { selectedCell, selectCell, inputValue, clearSelection } =
    useSudokuBoard(gameState.game_id, originalGrid, onMove);

  const isLocked = (row: number, col: number) => {
    return originalGrid?.[row]?.[col] !== 0;
  };

  const isSameBox = (row: number, col: number) => {
    if (!selectedCell) return false;

    // desecstructuring after seen alive
    const [sr, sc] = selectCell;

    return Math.floor(row / 3) === Math.floor(sr / 3) &&
           Math.floor(col / 3) === Math.floor(sc / 3);
  };

  // keyboard input handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled || gameState.status !== 'active') return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) inputValue(num);
      if (e.key === 'Backspace' || e.key == '0') inputValue(0);
      if (e.key === 'Escape') clearSelection();
    },
    [disabled, gameState.status, inputValue, clearSelection]
  );
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status bar */}
      <div className="text-sm font-mono text-gray-400">
        {gameState.status === 'active'
          ? `Difficulty: ${gameState.difficulty}`
          : gameState.status === 'won'
          ? '✅ Puzzle solved!'
          : '❌ Game over'}
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-9 border-2 border-gray-700"
        style={{ width: 'min(80vw, 450px)', height: 'min(80vw, 450px)' }}
      >
        {gameState.grid.map((row, rowIdx) =>
        row.map((value, colIdx) => {
          const isSelected =
            selectedCell?.[0] === rowIdx && selectedCell?.[1] === colIdx;
          const isSameRow = selectedCell?.[0] === rowIdx;
          const isSameCol = selectedCell?.[1] === colIdx;
          return (
            <button
              key={`${rowIdx}-${colIdx}`}
              disabled={disabled || isLocked(rowIdx, colIdx) || gameState.status !== 'active'}
              onClick={() => selectCell(rowIdx, colIdx)}
              className={getCellClasses(
                rowIdx, colIdx,
                isSelected,
                isLocked(rowIdx, colIdx),
                isSameRow,
                isSameCol,
                isSameBox(rowIdx, colIdx),
                value
              )}
            >
              {value !== 0 ? value : ''}
            </button>
          );
        })
      )}
      </div>
      {/* Number pad — for mobile */}
      {!disabled && gameState.status === 'active' && (
        <div className="grid grid-cols-9 gap-1" style={{ width: 'min(80vw, 450px)' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => inputValue(n)}
              className="aspect-square rounded bg-gray-100 hover:bg-blue-100 text-gray-700 font-mono font-bold text-sm transition-colors"
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
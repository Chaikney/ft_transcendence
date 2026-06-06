import { useEffect, useCallback } from "react";
import { useSudokuBoard } from './hooks/useSudokuBoard';
import type { CellValue, SudokuGameState, SudokuMovePayload } from "./types";

// ── Styles (never mix with logic) ─────────────────────────────────────────
const styles = {
  wrapper:   'flex flex-col items-center gap-4 animate-board-reveal',

  statusBar: 'flex items-center gap-3 h-7',
  diffBadge:
    'px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase ' +
    'bg-accent-bg border border-accent-border text-accent',
  statusWon:
    'text-xs font-mono tracking-widest uppercase text-status-success',
  statusLost:
    'text-xs font-mono tracking-widest uppercase text-status-error',

  boardWrapper:
    'rounded-lg overflow-hidden shadow-board border border-sudoku-border ' +
    'animate-board-reveal',
  boardGrid: 'grid grid-cols-9',

  padWrapper: 'grid grid-cols-9 gap-1',
  padButton:
    'aspect-square flex items-center justify-center ' +
    'font-mono font-medium text-sm rounded-md ' +
    'bg-bg-elevated border border-border text-text-secondary ' +
    'hover:bg-bg-overlay hover:text-text-primary hover:border-border-strong ' +
    'active:scale-95 transition-all duration-fast ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
} as const;

// ── Cell class builder ─────────────────────────────────────────────────────
const getCellClasses = (
  rowIdx:   number,
  colIdx: number,
  isSelected: boolean,
  isLocked: boolean,
  isRelated: boolean,
  value: CellValue
): string => {
    const base =
    'relative flex items-center justify-center font-mono select-none ' +
    'transition-colors duration-fast focus-visible:outline-none';

  const borderRight  = colIdx % 3 === 2 && colIdx !== 8
    ? 'border-r-[2px] border-r-sudoku-border-box'
    : 'border-r border-r-sudoku-border';
  const borderBottom = rowIdx % 3 === 2 && rowIdx !== 8
    ? 'border-b-[2px] border-b-sudoku-border-box'
    : 'border-b border-b-sudoku-border';
  const borderLeft   = 'border-l border-l-sudoku-border';
  const borderTop    = 'border-t border-t-sudoku-border';

  const bg = isSelected
    ? 'bg-sudoku-selected'
    : isRelated
    ? 'bg-sudoku-related'
    : 'bg-sudoku-cell';

  const text = isLocked
    ? 'text-sudoku-locked font-semibold cursor-default'
    : value !== null && value !== 0
    ? 'text-sudoku-input cursor-pointer'
    : 'text-transparent cursor-pointer';

  const ring = isSelected ? 'ring-1 ring-inset ring-accent/50' : '';

  // Hover (only unlocked, active cells)
  const hover = !isLocked
    ? 'hover:bg-bg-elevated'
    : '';

  return [base, borderRight, borderBottom, borderLeft, borderTop, bg, text, ring, hover]
    .filter(Boolean)
    .join(' ');
};

interface SudokuBoardProps {
  gameState: SudokuGameState;
  originalGrid: number[][];
  onMove: (payload: SudokuMovePayload) => void;
  disabled?: boolean;
}

// ── Component ──────────────────────────────────────────────────────────────
export const SudokuBoard = ({
  gameState,
  originalGrid,
  onMove,
  disabled = false,
}: SudokuBoardProps) => {

  // Type guard — defensive check from your arch update
  if (!gameState?.grid) return null;

  const { selectedCell, selectCell, inputValue, clearSelection } =
    useSudokuBoard(gameState.game_id, originalGrid, onMove);

  const isLocked = (row: number, col: number) =>
    originalGrid[row]?.[col] !== 0;

  const isRelatedCell = useCallback(
    (row: number, col: number) => {
      if (!selectedCell) return false;
      const [sr, sc] = selectedCell;
      return (
        sr === row ||
        sc === col ||
        (Math.floor(row / 3) === Math.floor(sr / 3) &&
          Math.floor(col / 3) === Math.floor(sc / 3))
      );
    },
    [selectedCell],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled || gameState.status !== 'active') return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) inputValue(num);
      if (e.key === 'Backspace' || e.key === '0') inputValue(0);
      if (e.key === 'Escape') clearSelection();
    },
    [disabled, gameState.status, inputValue, clearSelection],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const boardSize  = 'min(80vw, 450px)';
  const cellSize   = `calc(${boardSize} / 9)`;
  const isActive   = gameState.status === 'active';

  return (
    <div className={styles.wrapper}>

      {/* ── Status bar ── */}
      <div className={styles.statusBar}>
        {isActive && (
          <span className={styles.diffBadge}>
            {gameState.difficulty}
          </span>
        )}
        {gameState.status === 'won' && (
          <span className={styles.statusWon}>✓ Puzzle solved</span>
        )}
        {gameState.status === 'lost' && (
          <span className={styles.statusLost}>✕ Game over</span>
        )}
      </div>

      {/* ── Board ── */}
      <div
        className={styles.boardWrapper}
        style={{ width: boardSize, height: boardSize }}
      >
        <div
          data-testid="sudoku-board"
          className={styles.boardGrid}
          style={{ width: boardSize, height: boardSize }}
        >
          {gameState.grid.map((row, rowIdx) =>
            row.map((value, colIdx) => {
              const isSelected =
                selectedCell?.[0] === rowIdx &&
                selectedCell?.[1] === colIdx;
              const locked   = isLocked(rowIdx, colIdx);
              const related  = isRelatedCell(rowIdx, colIdx);

              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  disabled={disabled || locked || !isActive}
                  onClick={() => selectCell(rowIdx, colIdx)}
                  className={getCellClasses(
                    rowIdx, colIdx,
                    isSelected,
                    locked,
                    related,
                    value as CellValue,
                  )}
                  style={{
                    width:    cellSize,
                    height:   cellSize,
                    fontSize: `calc(${cellSize} * 0.44)`,
                  }}
                  aria-label={`Row ${rowIdx + 1}, column ${colIdx + 1}${value ? `, value ${value}` : ''}`}
                >
                  {value !== 0 ? value : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Number pad (mobile) ── */}
      {!disabled && isActive && (
        <div
          data-testid="sudoku-numpad"
          className={styles.padWrapper}
          style={{ width: boardSize }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => inputValue(n)}
              className={styles.padButton}
            >
              {n}
            </button>
          ))}
        </div>
      )}

    </div>
  );
};

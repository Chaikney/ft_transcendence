import { useEffect, useCallback } from 'react';
import { useSudokuBoard } from './hooks/useSudokuBoard';
import type { CellValue, SudokuGameState, SudokuMovePayload } from './types';

// ── Cell style builder (Uses CSS Variables for Cyber-Terminal look) ───────
const getCellStyle = (
  rowIdx:     number,
  colIdx:     number,
  isSelected: boolean,
  isRelated:  boolean,
  isLocked:   boolean,
  value:      CellValue,
): React.CSSProperties => {
  const isBoxRight  = colIdx % 3 === 2 && colIdx !== 8;
  const isBoxBottom = rowIdx % 3 === 2 && rowIdx !== 8;

  return {
    background: isSelected
      ? 'var(--sudoku-selected)'
      : isRelated
      ? 'rgba(56, 189, 248, 0.08)'
      : 'var(--sudoku-cell)',
    borderTop:    '1px solid var(--sudoku-border)',
    borderLeft:   '1px solid var(--sudoku-border)',
    borderRight:  isBoxRight  ? '2px solid var(--sudoku-border-box)' : '1px solid var(--sudoku-border)',
    borderBottom: isBoxBottom ? '2px solid var(--sudoku-border-box)' : '1px solid var(--sudoku-border)',
    color: isLocked
      ? 'var(--sudoku-locked)'
      : value !== null && value !== 0
      ? 'var(--sudoku-input)'
      : 'transparent',
    fontWeight: isLocked ? 600 : 400,
    outline:    isSelected ? '2px solid var(--accent)' : 'none',
    outlineOffset: '-2px',
    cursor: isLocked ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background var(--ease-fast)',
    fontFamily: 'var(--font-mono)',
    userSelect: 'none',
  };
};

// ── Static styles ──────────────────────────────────────────────────────────
const styles = {
  wrapper: 'flex flex-col items-center gap-4 animate-board-reveal',
  statusBar: 'flex items-center gap-3 h-7',
  diffBadge: 'px-2.5 py-0.5 rounded-none text-[10px] font-mono tracking-widest uppercase border border-accent text-accent',
  statusWon: 'text-xs font-mono tracking-widest uppercase text-status-success',
  statusLost: 'text-xs font-mono tracking-widest uppercase text-status-error',

  boardWrapper: 'rounded-none overflow-hidden border-2 border-accent shadow-[var(--shadow-board)]',
  boardGrid: 'grid grid-cols-9',
  padWrapper: 'grid grid-cols-9 gap-1.5',
  padButton: 'aspect-square flex items-center justify-center font-mono font-medium text-sm rounded-none border border-border-subtle bg-bg-surface text-text-secondary transition-all duration-[var(--ease-fast)] hover:border-accent hover:text-text-primary',
} as const;

// ── Props ──────────────────────────────────────────────────────────────────
interface SudokuBoardProps {
  gameState:    SudokuGameState;
  originalGrid: number[][];
  onMove:       (payload: SudokuMovePayload) => void;
  disabled?:    boolean;
}

// ── Component ──────────────────────────────────────────────────────────────
export const SudokuBoard = ({
  gameState,
  originalGrid,
  onMove,
  disabled = false,
}: SudokuBoardProps) => {
  if (!gameState?.grid) return null;

  const { selectedCell, selectCell, inputValue, clearSelection } =
    useSudokuBoard(gameState.game_id, originalGrid, onMove);

  const isLocked = (row: number, col: number) => originalGrid[row]?.[col] !== 0;

  const isRelatedCell = useCallback((row: number, col: number) => {
    if (!selectedCell) return false;
    const [sr, sc] = selectedCell;
    return (sr === row || sc === col || (Math.floor(row / 3) === Math.floor(sr / 3) && Math.floor(col / 3) === Math.floor(sc / 3)));
  }, [selectedCell]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled || gameState.status !== 'active') return;
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) inputValue(num);
    if (e.key === 'Backspace' || e.key === '0') inputValue(0);
    if (e.key === 'Escape') clearSelection();
  }, [disabled, gameState.status, inputValue, clearSelection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const boardSize = 'min(80vw, 450px)';
  const cellSize = `calc(${boardSize} / 9)`;
  const isActive = gameState.status === 'active';

  return (
    <div className={styles.wrapper}>
      <div className={styles.statusBar}>
        {isActive && <span className={styles.diffBadge}>{gameState.difficulty}</span>}
        {gameState.status === 'won' && <span className={styles.statusWon}>✓ Puzzle solved</span>}
        {gameState.status === 'lost' && <span className={styles.statusLost}>✕ Game over</span>}
      </div>

      <div className={styles.boardWrapper} style={{ width: boardSize, height: boardSize }}>
        <div data-testid="sudoku-board" className={styles.boardGrid} style={{ width: boardSize, height: boardSize }}>
          {gameState.grid.map((row, rowIdx) =>
            row.map((value, colIdx) => {
              const isSelected = selectedCell?.[0] === rowIdx && selectedCell?.[1] === colIdx;
              const locked = isLocked(rowIdx, colIdx);
              const related = isRelatedCell(rowIdx, colIdx);
              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  disabled={disabled || locked || !isActive}
                  onClick={() => selectCell(rowIdx, colIdx)}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    fontSize: `calc(${cellSize} * 0.44)`,
                    ...getCellStyle(rowIdx, colIdx, isSelected, related, locked, value as CellValue),
                  }}
                  aria-label={`Row ${rowIdx + 1}, col ${colIdx + 1}${value ? `, ${value}` : ''}`}
                >
                  {value !== 0 ? value : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      {!disabled && isActive && (
        <div data-testid="sudoku-numpad" className={styles.padWrapper} style={{ width: boardSize }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} onClick={() => inputValue(n)} className={styles.padButton}>
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
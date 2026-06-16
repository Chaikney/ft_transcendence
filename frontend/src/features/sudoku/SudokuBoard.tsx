import { useEffect, useCallback } from 'react';
import { useSudokuBoard } from './hooks/useSudokuBoard';
import type { CellValue, SudokuGameState, SudokuMovePayload } from './types';

// ── Theme: Aged Chess/Stone ──────────────────────────────────────────────
const THEME = {
  boardBg:      '#C5BAAC',
  cellDark:     'rgba(0, 0, 0, 0.12)',
  cellLight:    'transparent',
  focus:        'rgba(255, 149, 0, 0.4)',  // Naranja Ámbar Foco
  related:      'rgba(255, 149, 0, 0.15)', // Naranja Ámbar Cruz
  borderThin:   '1px solid rgba(80, 70, 60, 0.3)',
  borderThick:  '2px solid rgba(80, 70, 60, 0.6)',
  textLocked:   '#000000',
  textInput:    '#1a1a1a',
} as const;

// ── Cell style builder ────────────────────────────────────────────────────
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
  const isChessLight = (rowIdx + colIdx) % 2 === 0;

  // Selección lógica de fondo
  const getBg = () => {
    if (isSelected) return THEME.focus;
    if (isRelated) return THEME.related;
    return isChessLight ? THEME.cellLight : THEME.cellDark;
  };

  return {
    background: getBg(),
    borderTop:    'none',
    borderLeft:   'none',
    borderRight:  isBoxRight  ? THEME.borderThick : THEME.borderThin,
    borderBottom: isBoxBottom ? THEME.borderThick : THEME.borderThin,

    // Texto visible siempre que haya valor
    color: (value !== null && value !== 0)
      ? (isLocked ? THEME.textLocked : THEME.textInput)
      : 'transparent',

    fontWeight: isLocked ? 700 : 500,
    cursor: isLocked ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease', // Transición suave para el ámbar
    fontFamily: "'JetBrains Mono', monospace",
    userSelect: 'none' as const,
  };
};

// ── Tailwind Classes ──────────────────────────────────────────────────────
const styles = {
  wrapper:   'flex flex-col items-center gap-4 animate-board-reveal',
  boardWrapper: 'rounded-lg overflow-hidden border border-[#9A9184] shadow-[0_4px_16px_rgba(0,0,0,0.4)] bg-[#C5BAAC] p-[2px]',
  boardGrid: 'grid grid-cols-9',
  padWrapper: 'grid grid-cols-9 gap-1.5',
  padButton: 'aspect-square flex items-center justify-center font-mono font-medium text-sm rounded-md transition-all duration-200 border border-[#9A9184] bg-[#D1C7B7] hover:bg-[#BDB2A5] text-black',
} as const;

// ── Props definition ──
interface SudokuBoardProps {
  gameState:    SudokuGameState;
  originalGrid: number[][];
  onMove:       (payload: SudokuMovePayload) => void;
  disabled?:    boolean;
}

// ── Component ─────────────────────────────────────────────────────────────
>>>>>>> final-integration
export const SudokuBoard = ({
  gameState,
  originalGrid,
  onMove,
  disabled = false,
}: SudokuBoardProps) => {
<<<<<<< HEAD

  if (!gameState?.grid) return <div>Loading game...</div>;

  const { selectedCell, selectCell, inputValue, clearSelection } =
    useSudokuBoard(gameState.game_id, originalGrid, onMove);

  const isLocked = (row: number, col: number) => {
    return originalGrid[row]?.[col] !== 0;
  };

  const isRelatedCell = useCallback((row: number, col: number) => {
    if (!selectedCell) return false;
    const [sr, sc] = selectedCell;
    const isSameRow = sr === row;
    const isSameCol = sc === col;
    const isSameBox = Math.floor(row / 3) === Math.floor(sr / 3) &&
                      Math.floor(col / 3) === Math.floor(sc / 3);
    return isSameRow || isSameCol || isSameBox;
  }, [selectedCell]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled || gameState.status !== 'active') return;

    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) inputValue(num);
    if (e.key === 'Backspace' || e.key === '0') inputValue(0);
    if (e.key === 'Escape') clearSelection();
  }, [disabled, gameState.status, inputValue, clearSelection]);

=======
  if (!gameState?.grid) return null;

  const { selectedCell, selectCell, inputValue, clearSelection } =
    useSudokuBoard(gameState.game_id, originalGrid, onMove);

  const isLocked = (row: number, col: number) => originalGrid[row]?.[col] !== 0;

  // Lógica de Cruz (Fila, Columna, Bloque)
  const isRelatedCell = useCallback(
    (row: number, col: number) => {
      if (!selectedCell) return false;
      const [sr, sc] = selectedCell;
      const sameRow = sr === row;
      const sameCol = sc === col;
      const sameBox = Math.floor(row / 3) === Math.floor(sr / 3) &&
                      Math.floor(col / 3) === Math.floor(sc / 3);
      return (sameRow || sameCol || sameBox) && !(sr === row && sc === col);
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

>>>>>>> final-integration
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

<<<<<<< HEAD
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm font-mono text-gray-400">
        {gameState.status === 'active' ? `Difficulty: ${gameState.difficulty}` : gameState.status.toUpperCase()}
      </div>

      <div className="grid grid-cols-9 border-2 border-gray-700" style={{ width: 'min(80vw, 450px)', height: 'min(80vw, 450px)' }}>
        {gameState.grid.map((row, rowIdx) =>
          row.map((value, colIdx) => {
            const isSelected = selectedCell?.[0] === rowIdx && selectedCell?.[1] === colIdx;
            const isLockedCell = isLocked(rowIdx, colIdx);

            // Lógica de deshabilitado:
            // El atributo HTML 'disabled' solo debería aplicarse si el tablero está pausado,
            // la celda está bloqueada originalmente, o el juego no está activo.
            const isHtmlDisabled = disabled || isLockedCell || gameState.status !== 'active';

            return (
              <button
                key={`${rowIdx}-${colIdx}`}
                // Esto controla si el botón es clicable en el DOM (lo que los tests buscan)
                disabled={isHtmlDisabled}
                // Esto controla la lógica de negocio
                onClick={() => {
                  if (!isHtmlDisabled) {
                    selectCell(rowIdx, colIdx);
                  }
                }}
                className={getCellClasses(
                  isSelected,
                  isLockedCell,
                  isRelatedCell(rowIdx, colIdx),
                  value as CellValue
                )}
              >
                {value !== 0 ? value : ''}
              </button>
            );
          })
        )}
      </div>

      {!disabled && gameState.status === 'active' && (
        <div data-testid="number-pad" className="grid grid-cols-9 gap-1" style={{ width: 'min(80vw, 450px)' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} onClick={() => inputValue(n)} className="aspect-square rounded bg-gray-100 hover:bg-blue-100 text-gray-700 font-bold">
=======
  const boardSize = 'min(80vw, 450px)';
  const cellSize  = `calc(${boardSize} / 9)`;
  const isActive  = gameState.status === 'active';

  return (
    <div className={styles.wrapper}>
      {/* ── Board ── */}
      <div className={styles.boardWrapper} style={{ width: boardSize, height: boardSize }}>
        <div className={styles.boardGrid} style={{ width: boardSize, height: boardSize }}>
          {gameState.grid.map((row, rowIdx) =>
            row.map((value, colIdx) => {
              const isSelected = selectedCell?.[0] === rowIdx && selectedCell?.[1] === colIdx;
              const locked  = isLocked(rowIdx, colIdx);
              const related = isRelatedCell(rowIdx, colIdx);

              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  disabled={disabled || (locked && !isSelected)}
                  onClick={() => selectCell(rowIdx, colIdx)}
                  style={{
                    width: cellSize, height: cellSize,
                    fontSize: `calc(${cellSize} * 0.44)`,
                    ...getCellStyle(rowIdx, colIdx, isSelected, related, locked, value as CellValue),
                  }}
                >
                  {value !== 0 ? value : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Number pad ── */}
      {!disabled && isActive && (
        <div className={styles.padWrapper} style={{ width: boardSize }}>
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

import { useEffect, useCallback } from "react";
import { useSudokuBoard } from './hooks/useSudokuBoard';
import type { CellValue, SudokuGameState, SudokuMovePayload } from "./types";

interface SudokuBoardProps {
  gameState: SudokuGameState;
  originalGrid: number[][];
  onMove: (payload: SudokuMovePayload) => void;
  disabled?: boolean;
}

const getCellClasses = (
  isSelected: boolean,
  isLocked: boolean,
  isRelated: boolean,
  value: CellValue
): string => {
  const base = 'relative flex items-center justify-center text-lg font-mono select-none transition-colors duration-100 cursor-pointer';

  const bg = isSelected
    ? 'bg-blue-400'
    : isRelated
    ? 'bg-blue-50'
    : 'bg-white';

  const text = isLocked
    ? 'text-gray-800 font-bold cursor-default'
    : value !== null
    ? 'text-blue-600'
    : 'text-transparent';

  return `${base} border border-gray-300 ${bg} ${text}`;
};

export const SudokuBoard = ({
  gameState,
  originalGrid,
  onMove,
  disabled = false,
}: SudokuBoardProps) => {
  
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
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
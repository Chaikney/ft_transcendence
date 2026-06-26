import { useEffect, useCallback } from 'react';
import { useSudokuBoard } from './hooks/useSudokuBoard';
import type { CellValue, SudokuGameState, SudokuMovePayload } from './types';
import { useToast } from '@/components/Toast';

const THEME = {
  boardBg:      '#C5BAAC',
  cellDark:     'rgba(0, 0, 0, 0.12)',
  cellLight:    'transparent',
  focus:        'rgba(255, 149, 0, 0.4)',
  related:      'rgba(255, 149, 0, 0.15)',
  conflict:     'rgba(220, 50, 50, 0.35)',
  borderThin:   '1px solid rgba(80, 70, 60, 0.3)',
  borderThick:  '2px solid rgba(80, 70, 60, 0.6)',
  textLocked:   '#000000',
  textInput:    '#1a1a1a',
  textConflict: '#c0392b',
} as const;

const getConflictCells = (grid: number[][]): Set<string> => {
  const conflicts = new Set<string>();

  for (let r = 0; r < 9; r++) {
    const seen = new Map<number, number>();
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (v === 0) continue;
      if (seen.has(v)) {
        conflicts.add(`${r}-${seen.get(v)}`);
        conflicts.add(`${r}-${c}`);
      } else seen.set(v, c);
    }
  }

  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, number>();
    for (let r = 0; r < 9; r++) {
      const v = grid[r][c];
      if (v === 0) continue;
      if (seen.has(v)) {
        conflicts.add(`${seen.get(v)}-${c}`);
        conflicts.add(`${r}-${c}`);
      } else seen.set(v, r);
    }
  }

  for (let boxR = 0; boxR < 3; boxR++) {
    for (let boxC = 0; boxC < 3; boxC++) {
      const seen = new Map<number, string>();
      for (let r = boxR * 3; r < boxR * 3 + 3; r++) {
        for (let c = boxC * 3; c < boxC * 3 + 3; c++) {
          const v = grid[r][c];
          if (v === 0) continue;
          if (seen.has(v)) {
            conflicts.add(seen.get(v)!);
            conflicts.add(`${r}-${c}`);
          } else seen.set(v, `${r}-${c}`);
        }
      }
    }
  }

  return conflicts;
};

const getCellStyle = (
  rowIdx:     number,
  colIdx:     number,
  isSelected: boolean,
  isRelated:  boolean,
  isConflict: boolean,
  isLocked:   boolean,
  value:      CellValue,
): React.CSSProperties => {
  const isBoxRight   = colIdx % 3 === 2 && colIdx !== 8;
  const isBoxBottom  = rowIdx % 3 === 2 && rowIdx !== 8;
  const isChessLight = (rowIdx + colIdx) % 2 === 0;

  const getBg = () => {
    if (isSelected) return THEME.focus;
    if (isConflict) return THEME.conflict;
    if (isRelated)  return THEME.related;
    return isChessLight ? THEME.cellLight : THEME.cellDark;
  };

  return {
    background:     getBg(),
    borderTop:      'none',
    borderLeft:     'none',
    borderRight:    isBoxRight  ? THEME.borderThick : THEME.borderThin,
    borderBottom:   isBoxBottom ? THEME.borderThick : THEME.borderThin,
    color: (value !== null && value !== 0)
      ? (isConflict ? THEME.textConflict : isLocked ? THEME.textLocked : THEME.textInput)
      : 'transparent',
    fontWeight:     isLocked ? 700 : 500,
    cursor:         isLocked ? 'default' : 'pointer',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    transition:     'background-color 0.2s ease',
    fontFamily:     "'JetBrains Mono', monospace",
    userSelect:     'none' as const,
  };
};

interface SudokuBoardProps {
  gameState:    SudokuGameState;
  originalGrid: number[][];
  onMove:       (payload: SudokuMovePayload) => void;
  disabled?:    boolean;
}

export const SudokuBoard = ({
  gameState,
  originalGrid,
  onMove,
  disabled = false,
}: SudokuBoardProps) => {
  const { error } = useToast();

  // 3. Pásalo al hook de Sudoku
  const { selectedCell, selectCell, inputValue, clearSelection } = useSudokuBoard(
    gameState.game_id, 
    originalGrid, 
    gameState.grid, 
    onMove,
    () => error("Ese número no puede ir ahí, intenta otro.", "Movimiento Inválido") // Feedback!
  );

  const conflictCells = getConflictCells(gameState.grid);

  const isLocked = (row: number, col: number) => originalGrid[row]?.[col] !== 0;

  const isRelatedCell = useCallback(
    (row: number, col: number) => {
      if (!selectedCell) return false;
      const [sr, sc] = selectedCell;
      return (sr === row || sc === col ||
        (Math.floor(row / 3) === Math.floor(sr / 3) &&
         Math.floor(col / 3) === Math.floor(sc / 3)))
        && !(sr === row && sc === col);
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

  const boardSize = 'min(80vw, 450px)';
  const cellSize  = `calc(${boardSize} / 9)`;

  return (
    <div className="flex flex-col items-center gap-4 animate-board-reveal">
      <div className="rounded-lg overflow-hidden border border-[#9A9184] shadow-[0_4px_16px_rgba(0,0,0,0.4)] bg-[#C5BAAC] p-[2px]" style={{ width: boardSize, height: boardSize }}>
        <div className="grid grid-cols-9" style={{ width: boardSize, height: boardSize }}>
          {gameState.grid.map((row, rowIdx) =>
            row.map((value, colIdx) => {
              const isSelected = selectedCell?.[0] === rowIdx && selectedCell?.[1] === colIdx;
              const locked     = isLocked(rowIdx, colIdx);
              const related    = isRelatedCell(rowIdx, colIdx);
              const isConflict = conflictCells.has(`${rowIdx}-${colIdx}`);

              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  disabled={disabled || (locked && !isSelected)}
                  onClick={() => selectCell(rowIdx, colIdx)}
                  style={{
                    width: cellSize, height: cellSize,
                    fontSize: `calc(${cellSize} * 0.44)`,
                    ...getCellStyle(rowIdx, colIdx, isSelected, related, isConflict, locked, value as CellValue),
                  }}
                >
                  {value !== 0 ? value : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      {!disabled && gameState.status === 'active' && (
        <div className="grid grid-cols-10 gap-1.5" style={{ width: boardSize }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => inputValue(n)}
              className="aspect-square flex items-center justify-center font-mono font-medium text-sm rounded-md transition-all duration-200 border border-[#9A9184] bg-[#D1C7B7] hover:bg-[#BDB2A5] text-black"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => inputValue(0)}
            className="aspect-square flex items-center justify-center font-mono font-medium text-sm rounded-md transition-all duration-200 border border-[#9A9184] bg-[#D1C7B7] hover:bg-[#BDB2A5] text-black opacity-60"
            title="Erase"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
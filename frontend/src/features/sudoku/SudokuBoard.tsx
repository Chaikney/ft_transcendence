import { useEffect, useCallback, useState } from 'react';
import { useSudokuBoard } from './hooks/useSudokuBoard';
import type { CellValue, SudokuGameState, SudokuMovePayload } from './types';
import { useToast } from '@/components/Toast';

const THEME = {
  boardBg:      '#C5BAAC',
  cellDark:     '#C5BAAC',
  cellLight:    '#C5BAAC',
  focus:        '#f7a605',
  sameNumber:   '#c0392b',
  conflict:     '#f7230b',
  borderThick: '4px solid #f1f1f1',
  borderThin:   '1px solid #bb8416',
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
      if (seen.has(v)) { conflicts.add(`${r}-${seen.get(v)}`); conflicts.add(`${r}-${c}`); }
      else seen.set(v, c);
    }
  }
  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, number>();
    for (let r = 0; r < 9; r++) {
      const v = grid[r][c];
      if (v === 0) continue;
      if (seen.has(v)) { conflicts.add(`${seen.get(v)}-${c}`); conflicts.add(`${r}-${c}`); }
      else seen.set(v, r);
    }
  }
  for (let boxR = 0; boxR < 3; boxR++) {
    for (let boxC = 0; boxC < 3; boxC++) {
      const seen = new Map<number, string>();
      for (let r = boxR * 3; r < boxR * 3 + 3; r++) {
        for (let c = boxC * 3; c < boxC * 3 + 3; c++) {
          const v = grid[r][c];
          if (v === 0) continue;
          if (seen.has(v)) { conflicts.add(seen.get(v)!); conflicts.add(`${r}-${c}`); }
          else seen.set(v, `${r}-${c}`);
        }
      }
    }
  }
  return conflicts;
};

const getCellStyle = (
  isSelected: boolean,
  isSameNumber: boolean,
  isConflict: boolean,
  isLocked: boolean,
  value: CellValue,
  rowIdx: number,
  colIdx: number
): React.CSSProperties => {
  const isBoxRight = colIdx % 3 === 2 && colIdx !== 8;
  const isBoxBottom = rowIdx % 3 === 2 && rowIdx !== 8;
  const isChessLight = (rowIdx + colIdx) % 2 === 0;

  const getBg = () => {
    if (isSelected) return THEME.focus;
    if (isSameNumber) return THEME.sameNumber;
    if (isConflict) return THEME.conflict;
    return isChessLight ? THEME.cellLight : THEME.cellDark;
  };

  return {
    background: getBg(),
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: isBoxRight ? THEME.borderThick : THEME.borderThin,
    borderBottom: isBoxBottom ? THEME.borderThick : THEME.borderThin,
    color: (value !== null && value !== 0)
      ? (isConflict ? THEME.textConflict : isLocked ? THEME.textLocked : THEME.textInput)
      : 'transparent',
    fontWeight: isLocked ? 700 : 500,
    cursor: isLocked ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
    fontFamily: "'JetBrains Mono', monospace",
    userSelect: 'none' as const,
  };
};

interface SudokuBoardProps {
  gameState: SudokuGameState;
  originalGrid: number[][];
  onMove: (payload: SudokuMovePayload) => void;
  disabled?: boolean;
}

export const SudokuBoard = ({ gameState, originalGrid, onMove, disabled = false }: SudokuBoardProps) => {
  const { error } = useToast();
  const [activePanelNumber, setActivePanelNumber] = useState<number | null>(null);

  const { selectedCell, selectCell, inputValue, clearSelection } = useSudokuBoard(
    gameState.game_id, originalGrid, gameState.grid, onMove,
    () => error("That number cannot go there, try another.", "Invalid Move", 'lg')
  );

  const conflictCells = getConflictCells(gameState.grid);
  const isLocked = (row: number, col: number) => originalGrid[row]?.[col] !== 0;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled || gameState.status !== 'active') return;
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9) {
      inputValue(num);
      setActivePanelNumber(num);
    }
    if (e.key === 'Backspace' || e.key === '0') {
      inputValue(0);
      setActivePanelNumber(null);
    }
    if (e.key === 'Escape') {
      clearSelection();
      setActivePanelNumber(null);
    }
  }, [disabled, gameState.status, inputValue, clearSelection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const boardSize = 'min(80vw, 450px)';
  const cellSize = `calc(${boardSize} / 9)`;

  const selectedValue = selectedCell ? gameState.grid[selectedCell[0]][selectedCell[1]] : null;

  return (
    <div className="flex flex-col items-center gap-4 animate-board-reveal">
      <div className="rounded-lg overflow-hidden border border-[#9A9184] shadow-[0_4px_16px_rgba(0,0,0,0.4)] bg-[#C5BAAC] p-[2px]" style={{ width: boardSize, height: boardSize }}>
        <div className="grid grid-cols-9" style={{ width: boardSize, height: boardSize }}>
          {gameState.grid.map((row, rowIdx) => row.map((value, colIdx) => {
            const isSelected = selectedCell?.[0] === rowIdx && selectedCell?.[1] === colIdx;

            // Resaltar si coincide con la celda seleccionada O con el número seleccionado en el panel
            const isSameNumber = (
              (selectedValue !== null && selectedValue !== 0 && value !== 0 && Number(value) === Number(selectedValue)) ||
              (activePanelNumber !== null && value !== 0 && Number(value) === activePanelNumber)
            );

            const locked = isLocked(rowIdx, colIdx);
            const isConflict = conflictCells.has(`${rowIdx}-${colIdx}`);

            return (
              <button
                key={`${rowIdx}-${colIdx}`}
                disabled={disabled || (locked && !isSelected)}
                onClick={() => {
                  selectCell(rowIdx, colIdx);
                  setActivePanelNumber(null); // Limpiamos el panel al tocar el tablero
                }}
                style={{
                  width: cellSize, height: cellSize,
                  fontSize: `calc(${cellSize} * 0.44)`,
                  ...getCellStyle(isSelected, isSameNumber, isConflict, locked, value as CellValue, rowIdx, colIdx),
                }}
              >

                <div style={{ opacity: disabled || (locked && !isSelected) ? 0.4 : 1 }}>
                  {value !== 0 ? value : ''}
              </div>
              </button>
            );
          }))}
        </div>
      </div>

      {!disabled && gameState.status === 'active' && (
        <div className="grid grid-cols-10 gap-1.5" style={{ width: boardSize }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => {
                inputValue(n);
                setActivePanelNumber(n);
              }}
              className="aspect-square flex items-center justify-center font-mono font-medium text-sm rounded-md transition-all duration-200 border border-[#9A9184] bg-[#D1C7B7] hover:bg-[#BDB2A5] text-black"
            >
                {n}
            </button>
          ))}
          <button
            onClick={() => { inputValue(0); setActivePanelNumber(null); }}
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

import { useState, useCallback } from "react";
import type { SudokuMovePayload } from "../types";

interface UseSudokuBoardReturn {
  selectedCell: [number, number] | null;
  selectCell: (row: number, col: number) => void;
  inputValue: (value: number) => void;
  clearSelection: () => void;
}

const isValidMove = (grid: number[][], row: number, col: number, value: number): boolean => {
  if (value === 0) return true; // Borrar es siempre válido
  
  // Validar fila y columna
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === value || grid[i][col] === value) return false;
  }
  
  // Validar caja 3x3
  const boxR = Math.floor(row / 3) * 3;
  const boxC = Math.floor(col / 3) * 3;
  for (let r = boxR; r < boxR + 3; r++) {
    for (let c = boxC; c < boxC + 3; c++) {
      if (grid[r][c] === value) return false;
    }
  }
  return true;
};

export const useSudokuBoard = (
  gameId: string,
  originalGrid: number[][], // Celdas bloqueadas (iniciales)
  currentGrid: number[][],  // Tablero actual (para validar)
  onMove: (payload: SudokuMovePayload) => void,
  onInvalidMove: () => void
): UseSudokuBoardReturn => {
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

  const isLocked = useCallback(
    (row: number, col: number): boolean => originalGrid[row][col] !== 0,
    [originalGrid]
  );

  const selectCell = (row: number, col: number) => {
    if (isLocked(row, col)) return;
    setSelectedCell([row, col]);
  };

  const inputValue = (value: number) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    if (isLocked(row, col)) return;

    if (value !== 0 && !isValidMove(currentGrid, row, col, value)) {
      onInvalidMove();
      return; 
    }

    // Preparar el nuevo tablero para el backend
    const newGrid = currentGrid.map(r => [...r]);
    newGrid[row][col] = value;
    const boardString = newGrid.flat().join('');

    // Emitir el movimiento solo si es válido
    onMove({ 
      game_id: gameId, 
      row, 
      col, 
      value, 
      board: boardString 
    });
    
    setSelectedCell(null);
  };

  const clearSelection = () => setSelectedCell(null);

  return { selectedCell, selectCell, inputValue, clearSelection };
};
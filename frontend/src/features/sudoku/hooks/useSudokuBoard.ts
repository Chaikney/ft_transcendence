import { useState, useCallback } from "react";
import type { SudokuMovePayload } from "../types";

interface UseSudokuBoardReturn {
  selectedCell: [number, number] | null;
  selectCell: (row: number, col: number) => void;
  inputValue: (value: number) => void;
  clearSelection: () => void;
}

export const useSudokuBoard = (
  gameId: string,
  originalGrid: number[][], // the initial state - locked cells
  onMove: (payload: SudokuMovePayload) => void
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

    // Emit upward — never mutate grid directly here
    onMove({ game_id: gameId, row, col, value });
    setSelectedCell(null);
  };
  const clearSelection = () => setSelectedCell(null);

  return { selectedCell, selectCell, inputValue, clearSelection };
};

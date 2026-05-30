import { useState } from 'react';
import type { ChessMove } from '../types';

interface UseChessBoardReturn {
  selectedSquare: string | null;
  selectSquare: (square: string) => void;
  pendingMove: ChessMove | null;
  clearSelection: () => void;
}

export const useChessBoard = (
  onMoveReady: (move: Omit<ChessMove, 'piece'>) => void
): UseChessBoardReturn => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<ChessMove | null>(null);

  const selectSquare = (square: string) => {
    if (!selectedSquare) {// first click - select origin
      setSelectedSquare(square);
      return;
    }
    if (selectedSquare === square) {//clicked same squre - deselected
      setSelectedSquare(null);
      return;
    }
    // Second click — emit move upward, never calculate chess logic here
    onMoveReady({ from: selectedSquare, to: square });
    setSelectedSquare(null);
    setPendingMove(null);
  };

  const clearSelection = () => {
    setSelectedSquare(null);
    setPendingMove(null);
  };
  return { selectedSquare, selectSquare, pendingMove, clearSelection };
}
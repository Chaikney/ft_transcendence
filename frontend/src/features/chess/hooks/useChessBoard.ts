import { useState } from 'react';
import type { ChessMove, ChessGameState } from '../types';

interface UseChessBoardReturn {
  selectedSquare: string | null;
  selectSquare: (square: string, piece?: string | null) => void;
  pendingMove: ChessMove | null;
  clearSelection: () => void;
}

export const useChessBoard = (
  onMoveReady: (move: Omit<ChessMove, 'piece'>) => void,
  gameState: ChessGameState,
  localPlayerColor: 'w' | 'b'
): UseChessBoardReturn => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<ChessMove | null>(null);

  const selectSquare = (square: string, pieceOnSquare?: string | null) => {
    // 1. Normalizamos: FEN siempre es 'w' o 'b' después del primer espacio
    const actualTurn = gameState.fen.split(' ')[1]; 

    // DEBUG: Mira esto en la consola (F12) si no te deja mover
    console.log(`Turno: ${actualTurn}, Tu color: ${localPlayerColor}`);

    // 🔒 CANDADO: Si no es tu turno, bloqueado
    if (actualTurn !== localPlayerColor) {
      return; 
    }

    if (!selectedSquare) {
      // Si la casilla está vacía, no seleccionamos nada
      if (!pieceOnSquare) return;

      // 🔒 CANDADO: Solo puedes seleccionar TUS piezas
      const isWhitePiece = pieceOnSquare === pieceOnSquare.toUpperCase();
      const pieceColor = isWhitePiece ? 'w' : 'b';

      if (pieceColor !== localPlayerColor) {
        console.log("No puedes mover piezas del rival");
        return; 
      }

      setSelectedSquare(square);
      return;
    }

    // Clic en la misma casilla: deseleccionar
    if (selectedSquare === square) {
      setSelectedSquare(null); 
      return;
    }

    // Segundo clic: Ejecutar movimiento
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
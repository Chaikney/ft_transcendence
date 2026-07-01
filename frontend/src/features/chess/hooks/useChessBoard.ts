import { useState, useEffect, useMemo, useRef } from 'react';
import { Chess } from 'chess.js';
import type { ChessMove, ChessGameState } from '../types';

interface UseChessBoardReturn {
  selectedSquare: string | null;
  selectSquare: (square: string, piece?: string | null) => void;
  pendingMove: ChessMove | null;
  clearSelection: () => void;
}

export const useChessBoard = (
  onMoveReady: (move: Omit<ChessMove, 'piece'>) => void,
  onDrawReady: () => void,
  gameState: ChessGameState,
  localPlayerColor: 'w' | 'b'
): UseChessBoardReturn => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<ChessMove | null>(null);
  
  // 🔒 EL SEGURO INDESTRUCTIBLE DEL ÁRBITRO
  // Usamos useRef en lugar de useState para que no se borre con los micro-cortes
  const drawClaimed = useRef(false);

  // 🧠 Instanciamos el motor de ajedrez solo para que haga de Árbitro
  const chess = useMemo(() => new Chess(), []);

  // 👨‍⚖️ EL ÁRBITRO LOCAL
  // 👨‍⚖️ EL ÁRBITRO LOCAL (Ahora en modo silencioso 🤫)
  useEffect(() => {
    if (!gameState.fen) return;
    
    // Si la partida ya terminó o ya hemos pitado el final, ignoramos el efecto
    if (gameState.status === 'draw' || gameState.status === 'finished' || drawClaimed.current) return;

    if (chess.fen() !== gameState.fen) {
      chess.load(gameState.fen);
    }

    // 1. Regla de 50 movimientos, Material Insuficiente o Ahogado
    if (chess.isDraw()) {
      drawClaimed.current = true;
      onDrawReady();
      return;
    }

    // 2. Triple repetición
    if (gameState.fen_history && Array.isArray(gameState.fen_history)) {
      const positionCounts: Record<string, number> = {};
      for (const historyFen of gameState.fen_history) {
        const positionState = historyFen.split(' ').slice(0, 4).join(' ');
        positionCounts[positionState] = (positionCounts[positionState] || 0) + 1;
        
        if (positionCounts[positionState] >= 3) {
          drawClaimed.current = true;
          onDrawReady();
          break;
        }
      }
    }
  }, [gameState.fen, gameState.fen_history, chess, onDrawReady, gameState.status]);

  const selectSquare = (square: string, pieceOnSquare?: string | null) => {
    const actualTurn = gameState.fen.split(' ')[1]; 

    console.log(`[♟️ CLIC] Casilla: ${square}, Pieza: ${pieceOnSquare || 'Vacía'}`);
    console.log(`[⚙️ LÓGICA] Turno real: ${actualTurn} | Tu navegador cree que tú eres: ${localPlayerColor}`);

    if (actualTurn !== localPlayerColor) {
      console.warn(`🔒 Bloqueado: Le toca a ${actualTurn}, pero tu cliente es ${localPlayerColor}`);
      return; 
    }

    if (!selectedSquare) {
      if (!pieceOnSquare) return;

      const isWhitePiece = pieceOnSquare === pieceOnSquare.toUpperCase();
      const pieceColor = isWhitePiece ? 'w' : 'b';

      if (pieceColor !== localPlayerColor) {
        console.warn(`🚫 Estás intentando tocar una pieza que no es tuya (Pieza: ${pieceColor})`);
        return; 
      }

      setSelectedSquare(square);
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null); 
      return;
    }

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
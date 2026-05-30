import { useMemo } from 'react';
import { useChessBoard } from './hooks/useChessBoard';
import type { ChessGameState, ChessMove } from './types'

// FEN parser - converts FEN string to 8x8 matrix of piece symbols
const parseFen = (fen: string): (string | null)[][] => {
  const rows = fen.split(' ')[0].split('/');
  return rows.map((row) => {
    const cells: (string | null)[] = [];
    for (const char of row) {
      if (isNaN(Number(char))) {
        cells.push(char);// piece simbol
      } else {
        cells.push(...Array(Number(char)).fill(null));// empty squares
      }
    }
    return cells;
  });
};

// Squares notation from row/col index 
const toSquare = (row: number, col: number): string => {
  const file = String.fromCharCode(97 + col); // a-h
  const rank = String(8 - row);
  return `${file}${rank}`;
};

const PIECE_UNICODE: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙', // white ♔	 en hexadecimal = U+2654
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟', // black ♛	 en javascript =	\u265B
};

interface ChessBoardProps {
  gameState: ChessGameState;
  onMove: (move: Omit<ChessMove, 'piece'>) => void;
  disabled?: boolean; // lock board during AI move or opponent's turn
}

export const ChessBoard = ({ gameState, onMove, disabled = false }: ChessBoardProps) => {
  const { selectedSquare, selectSquare } = useChessBoard(onMove);
  const board = useMemo(() => parseFen(gameState.fen), [gameState.fen]);

  return (
    <div className="flex flex-col items-center gap-2">

      {/* Status bar */}
      <div className="text-sm font-mono text-gray-400 mb-1">
        {gameState.status === 'active'
          ? `${gameState.turn === 'white' ? '⬜' : '⬛'} ${gameState.turn}'s turn` // Cuadrado Blanco Grande	U+2B1C	\u2B1C
          : `Game over — ${gameState.status}`}
      </div>

      {/* Board */}
      <div
        className="grid grid-cols-8 border-2 border-gray-600"
        style={{ width: 'min(80vw, 480px)', height: 'min(80vw, 480px)' }}
      >
        {board.map((row, rowIdx) =>
          row.map((piece, colIdx) => {
            const square = toSquare(rowIdx, colIdx);
            const isLight = (rowIdx + colIdx) % 2 === 0;
            const isSelected = selectedSquare === square;
            const isLastMove =
              gameState.last_move?.from === square ||
              gameState.last_move?.to === square;

            return (
              <button
                key={square}
                disabled={disabled || gameState.status !== 'active'}
                onClick={() => selectSquare(square)}
                className={[
                  'flex items-center justify-center text-2xl select-none',
                  'transition-colors duration-100',
                  isLight ? 'bg-amber-100' : 'bg-amber-800',
                  isSelected && 'ring-4 ring-inset ring-yellow-400',
                  isLastMove && !isSelected && 'bg-yellow-300 opacity-80',
                  disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-75',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {piece && (
                  <span
                    className={
                      piece === piece.toUpperCase()
                        ? 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]'
                        : 'text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]'
                    }
                  >
                    {PIECE_UNICODE[piece] ?? piece}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* File labels */}
      <div className="flex" style={{ width: 'min(80vw, 480px)' }}>
        {['a','b','c','d','e','f','g','h'].map((f) => (
          <span key={f} className="flex-1 text-center text-xs text-gray-500 font-mono">
            {f}
          </span>
        ))}
      </div>

    </div>
  );
};

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
const toSquare = (row: number, col: number): string => 
  `${String.fromCharCode(97 + col)}${8 - row}`;

const PIECE_UNICODE: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙', // white ♔	 en hexadecimal = U+2654
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟', // black ♛	 en javascript =	\u265B
};

// ── Styles (never mix with logic above) ───────────────────────────────────
const styles = {
  wrapper:   'flex flex-col items-center gap-3 animate-board-reveal',

  // Status bar
  statusBar: 'flex items-center gap-2 h-7',
  turnDot:   'w-2.5 h-2.5 rounded-full border border-black/20',
  turnLabel: 'text-xs font-mono tracking-widest uppercase text-text-secondary',
  gameOver:  'text-xs font-mono tracking-widest uppercase text-status-error',

  // Board wrapper — shadow + border frame
  boardFrame:
    'relative rounded-lg overflow-hidden shadow-board ' +
    'border border-chess-border',

  // Rank labels column (left side)
  rankLabels:
    'absolute left-0 top-0 flex flex-col pointer-events-none z-10',
  rankLabel:
    'flex items-center justify-center text-[10px] font-mono text-chess-coord ' +
    'select-none',

  // File labels row (bottom)
  fileLabels: 'flex',
  fileLabel:
    'flex-1 text-center text-[10px] font-mono text-chess-coord select-none ' +
    'pt-1',

  // Board grid
  boardGrid: 'grid grid-cols-8',

  // Individual square
  squareBase:
    'relative flex items-center justify-center select-none ' +
    'transition-colors duration-fast',

  // Piece span
  pieceWhite:
    'text-chess-piece-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ' +
    'transition-transform duration-fast',
  pieceBlack:
    'text-chess-piece-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)] ' +
    'transition-transform duration-fast',

  // Last move indicator dot
  lastMoveDot:
    'absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full ' +
    'bg-chess-coord opacity-60',
} as const;

// ── Square class builder (separated from render) ───────────────────────────
const getSquareClasses = (
  isLight:    boolean,
  isSelected: boolean,
  isLastMove: boolean,
  disabled:   boolean,
): string => {
  const bg = isSelected
    ? 'bg-chess-selected'
    : isLastMove
    ? 'bg-chess-lastmove'
    : isLight
    ? 'bg-chess-light'
    : 'bg-chess-dark';

  const interaction = disabled
    ? 'cursor-not-allowed'
    : 'cursor-pointer hover:brightness-110 active:brightness-90';

  const ring = isSelected
    ? 'ring-2 ring-inset ring-accent/60'
    : '';

  return [styles.squareBase, bg, interaction, ring]
    .filter(Boolean)
    .join(' ');
};

interface ChessBoardProps {
  gameState: ChessGameState;
  onMove: (move: Omit<ChessMove, 'piece'>) => void;
  disabled?: boolean; // lock board during AI move or opponent's turn
}

export const ChessBoard = ({ gameState, onMove, disabled = false }: ChessBoardProps) => {
  const { selectedSquare, selectSquare } = useChessBoard(onMove);
  const board = useMemo(() => parseFen(gameState.fen), [gameState.fen]);

  const boardSize = 'min(80vw, 480px)';
  const squareSize = `calc(${boardSize} / 8)`;
  const isActive = gameState.status === 'active';

  return (
    <div className={styles.wrapper}>

      {/* ── Status bar ── */}
      <div className={styles.statusBar}>
        {isActive ? (
          <>
            <span
              className={styles.turnDot}
              style={{
                background: gameState.turn === 'white' ? '#f0d9b5' : '#1a1a2e',
              }}
            />
            <span className={styles.turnLabel}>
              {gameState.turn}&apos;s turn
            </span>
          </>
        ) : (
          <span className={styles.gameOver}>
            Game over — {gameState.status}
          </span>
        )}
      </div>

      {/* ── Board frame ── */}
      <div
        className={styles.boardFrame}
        style={{ width: boardSize, height: boardSize }}
      >
        {/* Rank labels (1-8) */}
        <div
          className={styles.rankLabels}
          style={{ width: squareSize, height: boardSize }}
        >
          {[8, 7, 6, 5, 4, 3, 2, 1].map((rank) => (
            <span
              key={rank}
              className={styles.rankLabel}
              style={{ height: squareSize }}
            >
              {rank}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div
          data-testid="chess-board"
          className={styles.boardGrid}
          style={{ width: boardSize, height: boardSize }}
        >
          {board.map((row, rowIdx) =>
            row.map((piece, colIdx) => {
              const square     = toSquare(rowIdx, colIdx);
              const isLight    = (rowIdx + colIdx) % 2 === 0;
              const isSelected = selectedSquare === square;
              const isLastMove =
                gameState.last_move?.from === square ||
                gameState.last_move?.to === square;

              return (
                <button
                  key={square}
                  disabled={disabled || !isActive}
                  onClick={() => selectSquare(square)}
                  className={getSquareClasses(
                    isLight, isSelected, isLastMove, disabled || !isActive
                  )}
                  style={{ width: squareSize, height: squareSize }}
                  aria-label={`${square}${piece ? ` ${piece}` : ''}`}
                >
                  {/* Piece */}
                  {piece && (
                    <span
                      className={
                        piece === piece.toUpperCase()
                          ? styles.pieceWhite
                          : styles.pieceBlack
                      }
                      style={{ fontSize: `calc(${squareSize} * 0.64)` }}
                    >
                      {PIECE_UNICODE[piece] ?? piece}
                    </span>
                  )}

                  {/* Last-move dot */}
                  {isLastMove && !isSelected && !piece && (
                    <span className={styles.lastMoveDot} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── File labels (a–h) ── */}
      <div className={styles.fileLabels} style={{ width: boardSize }}>
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((f) => (
          <span key={f} className={styles.fileLabel}>
            {f}
          </span>
        ))}
      </div>

    </div>
  );
};

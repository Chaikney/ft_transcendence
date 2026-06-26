import { useMemo } from 'react';
import { useChessBoard } from './hooks/useChessBoard';
import type { ChessGameState, ChessMove } from './types';

// ── Pure functions ──────────────────────────────────
const parseFen = (fen: string): (string | null)[][] => {
  const rows = fen.split(' ')[0].split('/');
  return rows.map((row) => {
    const cells: (string | null)[] = [];
    for (const char of row) {
      if (isNaN(Number(char))) {
        cells.push(char);
      } else {
        cells.push(...Array(Number(char)).fill(null));
      }
    }
    return cells;
  });
};

const toSquare = (row: number, col: number): string =>
  `${String.fromCharCode(97 + col)}${8 - row}`;

const PIECE_UNICODE: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

const getSquareBg = (isLight: boolean, isSelected: boolean, isLastMove: boolean): string => {
  if (isSelected) return 'var(--chess-selected)';
  if (isLastMove)  return 'var(--chess-lastmove)';
  return isLight ? 'var(--chess-light)' : 'var(--chess-dark)';
};

const styles = {
  wrapper: 'flex flex-col items-center gap-3 animate-board-reveal',
  statusBar: 'flex items-center gap-2 h-7',
  turnDot: 'w-2.5 h-2.5 rounded-full border border-black/20',
  turnLabel: 'text-xs font-mono tracking-widest uppercase text-text-secondary',
  gameOver: 'text-xs font-mono tracking-widest uppercase text-status-error',
  boardFrame: 'flex rounded-lg overflow-hidden border border-accent-border shadow-[var(--shadow-glow)] bg-bg-surface',
  rankLabels: 'flex flex-col justify-between pointer-events-none z-10 py-[calc(var(--square-size)/16)]',
  rankLabel: 'flex items-center justify-center text-[10px] font-mono text-accent font-bold select-none',
  fileLabels: 'flex',
  fileLabel: 'flex-1 text-center text-[10px] font-mono text-accent/70 select-none pt-1',
  boardGrid: 'grid grid-cols-8',
  squareBase: 'relative flex items-center justify-center select-none transition-[filter] duration-[var(--ease-fast)]',
  pieceWhite: 'text-[var(--chess-piece-white)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] transition-transform duration-[var(--ease-fast)]',
  pieceBlack: 'text-[var(--chess-piece-black)] drop-shadow-[0_1px_2px_rgba(56,189,248,0.2)] transition-transform duration-[var(--ease-fast)]',
  lastMoveDot: 'absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-none bg-accent opacity-60',
} as const;

interface ChessBoardProps {
  gameState: ChessGameState;
  onMove:    (move: Omit<ChessMove, 'piece'>) => void;
  disabled?: boolean;
  localPlayerColor?: 'w' | 'b';
}

export const ChessBoard = ({
  gameState,
  onMove,
  disabled = false,
  localPlayerColor = 'w'
}: ChessBoardProps) => {
  
  const { selectedSquare, selectSquare } = useChessBoard(onMove, gameState, localPlayerColor);
  const board = useMemo(() => parseFen(gameState.fen), [gameState.fen]);

  const boardSize  = 'min(80vw, 480px)';
  const squareSize = `calc(${boardSize} / 8)`;
  const isActive   = gameState.status === 'active';

  // 🥷 FIX: Invertimos el renderizado si somos las negras
  const displayRows = localPlayerColor === 'b' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const displayCols = localPlayerColor === 'b' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  
  const rankLabels = localPlayerColor === 'b' ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const fileLabels = localPlayerColor === 'b' ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className={styles.wrapper}>
      <div className={styles.statusBar}>
        {isActive ? (
          <>
            <span className={styles.turnDot} style={{ background: 'var(--accent)' }} />
            <span className={styles.turnLabel}>
              {gameState.fen.split(' ')[1] === 'w' ? 'White' : 'Black'}&apos;s turn
            </span>
          </>
        ) : (
          <span className={styles.gameOver}>Game over — {gameState.status}</span>
        )}
      </div>

      <div className={styles.boardFrame} style={{ width: `calc(${boardSize} + 25px)`, height: boardSize }}>
  
        <div className={styles.rankLabels} style={{ width: '20px', height: boardSize }}>
          {rankLabels.map((rank) => (
            <span key={rank} className={styles.rankLabel} style={{ height: squareSize }}>
              {rank}
            </span>
          ))}
        </div>

        <div data-testid="chess-board" className={styles.boardGrid} style={{ width: boardSize, height: boardSize }}>
          {displayRows.map((r) =>
            displayCols.map((c) => {
              const piece = board[r][c];
              const square = toSquare(r, c); // Calculamos la posición original
              const isLight = (r + c) % 2 === 0; // El color de la casilla siempre es el correcto
              const isSelected = selectedSquare === square;
              const isLastMove = gameState.last_move?.from === square || gameState.last_move?.to === square;
              const isDisabled = disabled || !isActive;

              return (
                <button
                  key={square}
                  disabled={isDisabled}
                  onClick={() => selectSquare(square, piece)}
                  className={[
                    styles.squareBase,
                    isSelected ? 'ring-2 ring-inset ring-accent' : '',
                    isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:brightness-110 active:brightness-90',
                  ].filter(Boolean).join(' ')}
                  style={{
                    width:      squareSize,
                    height:     squareSize,
                    background: getSquareBg(isLight, isSelected, isLastMove),
                    fontSize:   `calc(${squareSize} * 0.64)`,
                  }}
                  aria-label={`${square}${piece ? ` ${piece}` : ''}`}
                >
                  {piece && (
                    <span className={piece === piece.toUpperCase() ? styles.pieceWhite : styles.pieceBlack}>
                      {PIECE_UNICODE[piece] ?? piece}
                    </span>
                  )}
                  {isLastMove && !isSelected && !piece && <span className={styles.lastMoveDot} />}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className={styles.fileLabels} style={{ width: boardSize }}>
        {fileLabels.map((f) => (
          <span key={f} className={styles.fileLabel}>{f}</span>
        ))}
      </div>
    </div>
  );
};
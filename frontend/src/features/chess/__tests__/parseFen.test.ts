import { describe, it, expect } from 'vitest';

// copy the function here or export it from ChessBoard.tsx
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

const toSquare = (row: number, col: number): string => {
  const file = String.fromCharCode(97 + col);
  const rank = String(8 - row);
  return `${file}${rank}`;
};

describe('parseFen', () => {
  it('parses starting position into 8x8 matrix', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const board = parseFen(fen);
    expect(board).toHaveLength(8);
    expect(board[0]).toHaveLength(8);
  });

  it('row 0 has correct black pieces', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const board = parseFen(fen);
    expect(board[0]).toEqual(['r','n','b','q','k','b','n','r']);
  });

  it('row 7 has correct white pieces', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const board = parseFen(fen);
    expect(board[7]).toEqual(['R','N','B','Q','K','B','N','R']);
  });

  it('empty rows are filled with null', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const board = parseFen(fen);
    expect(board[2]).toEqual(Array(8).fill(null));
  });

  it('parses e2e4 position correctly', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
    const board = parseFen(fen);
    expect(board[4][4]).toBe('P'); // e4
    expect(board[6][4]).toBeNull(); // e2 now empty
  });
});

describe('toSquare', () => {
  it('converts (7,0) to a1', () => expect(toSquare(7, 0)).toBe('a1'));
  it('converts (0,0) to a8', () => expect(toSquare(0, 0)).toBe('a8'));
  it('converts (0,7) to h8', () => expect(toSquare(0, 7)).toBe('h8'));
  it('converts (7,7) to h1', () => expect(toSquare(7, 7)).toBe('h1'));
  it('converts (6,4) to e2', () => expect(toSquare(6, 4)).toBe('e2'));
});
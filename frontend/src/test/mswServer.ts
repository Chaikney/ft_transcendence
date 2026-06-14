import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { mockChessGame, mockChessGameAfterMove, mockSudokuGame } from '@/mocks';

export const handlers = [
  http.get('*/chess/games/:id', () =>
    HttpResponse.json({ data: mockChessGame })
  ),
  http.post('*/chess/move', () =>
    HttpResponse.json({ data: mockChessGameAfterMove })
  ),
  http.post('*/chess/ai_move', () =>
    HttpResponse.json({ data: mockChessGameAfterMove })
  ),
  http.get('*/sudoku/games/:id', () =>
    HttpResponse.json({ data: mockSudokuGame })
  ),
  http.post('*/sudoku/move', () =>
    HttpResponse.json({ data: mockSudokuGame })
  ),
];

// Reusable error overrides — import these in tests that need failure scenarios
export const errorHandlers = {
  chessLoadFail: http.get('*/chess/games/:id', () =>
    HttpResponse.json({ error: 'Not found' }, { status: 404 })
  ),
  chessMoveail: http.post('*/chess/move', () =>
    HttpResponse.json({ error: 'Server error' }, { status: 500 })
  ),
  sudokuLoadFail: http.get('*/sudoku/games/:id', () =>
    HttpResponse.json({ error: 'Not found' }, { status: 404 })
  ),
};

export const server = setupServer(...handlers);
import type { ChessGameState } from "@/features/chess/types";

export const mockChessGame: ChessGameState = {
  game_id: 'chess-mock-001',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // standard start
  turn: 'white',
  status: 'active',
  last_move: null,
};

export const mockChessGameAfterMove: ChessGameState = {
  game_id: 'chess-mock-001',
  fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', // e2→e4
  turn: 'black',
  status: 'active',
  last_move: {
    from: 'e2',
    to: 'e4',
    piece: 'P',
  },
};

export const mockChessGameCheckmate: ChessGameState = {
  game_id: 'chess-mock-001',
  fen: 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3', // fool's mate
  turn: 'white',
  status: 'checkmate',
  last_move: {
    from: 'd8',
    to: 'h4',
    piece: 'Q',
  },
} ;
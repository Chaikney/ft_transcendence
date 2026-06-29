import { create } from 'zustand';
import type { ChessGameState } from '@/features/chess/types';
import type { SudokuGameState } from '@/features/sudoku/types';

type GameType = 'chess' | 'sudoku' | null;
type MatchStatus = 'idle' | 'loading' | 'lobby' | 'in_progress' | 'finished' | 'error';

interface Opponent {
  id: number;
  username: string;
  elo: number;
}

export interface MatchState {
  status: MatchStatus;
  gameType: GameType;
  opponent: Opponent | null;
  chessGame: ChessGameState;
  error: string | null;

  // Actions
  startLoading: (gameType: GameType) => void;
  setLobby: (gameType: GameType, opponent: Opponent) => void;
  setChessGame: (game: ChessGameState) => void;
  updateCell: (row: number, col: number, value: number) => void;
  setError: (message: string) => void;
  resetMatch: () => void;
}

const initialState = {
  status: 'idle' as MatchStatus,
  gameType: null as GameType,
  opponent: null,
  chessGame: null,
  sudokuGame: null,
  error: null,
};

export const useMatchStore = create<MatchState>((set) => ({
  ...initialState,

  startLoading: (gameType) =>
    set({ status: 'loading', gameType, error: null }),

  // 👇 ¡AQUÍ ESTÁ LA FUNCIÓN QUE FALTABA!
  setLobby: (gameType, opponent) =>
    set({ status: 'lobby', gameType, opponent, error: null }),

setChessGame: (game) =>
    set((state) => {
      // 1. Rescatamos el historial anterior (si existe en el estado actual)
      const prevHistory = state.chessGame?.fen_history || [];

      // 2. Si el backend nos manda un historial nuevo, lo usamos.
      // Si no, le añadimos nosotros mismos el FEN actual al historial viejo.
      // (Comprobamos que no sea el mismo para no duplicar fotos si React redibuja dos veces)
      const isDuplicate = prevHistory[prevHistory.length - 1] === game.fen;
      const updatedHistory = game.fen_history || (isDuplicate ? prevHistory : [...prevHistory, game.fen]);

      return {
        // 3. Fusionamos los datos: mantenemos lo viejo (IDs) y sobrescribimos con lo nuevo (FEN)
        chessGame: {
          ...(state.chessGame || {}), // Conserva player_ids, ids del juego, etc.
          ...game,                    // Sobrescribe FEN, turn y last_move
          fen_history: updatedHistory // Inyectamos nuestro historial blindado
        },
        status: state.status === 'lobby' ? 'lobby' : 'in_progress',
        error: null
      };
    }),

  setSudokuGame: (game) =>
    set((state) => ({
      sudokuGame: game,
      status: state.status === 'lobby' ? 'lobby' : 'in_progress',
      error: null
    })),

  updateCell: (row, col, value) =>
    set((state) => {
      if (!state.sudokuGame) return state;
      const newGrid = state.sudokuGame.grid.map((r, rIdx) =>
        r.map((cell, cIdx) => (rIdx === row && cIdx === col ? value : cell))
      );
      return { sudokuGame: { ...state.sudokuGame, grid: newGrid } };
    }),

  setError: (message) =>
    set({ status: 'error', error: message }),

  resetMatch: () =>
    set({ ...initialState }),
}));

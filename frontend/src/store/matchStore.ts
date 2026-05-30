import { create } from 'zustand';
import type { ChessGameState } from '@/features/chess/types';
import type { SudokuGameState } from '@/features/sudoku/types';

type GameType = 'chess' | 'sudoku' | null;
type MatchStatus = 'idle' | 'loading' | 'in_progress' | 'finished' | 'error';

interface MatchState {
  status: MatchStatus;
  gameType: GameType;
  chessGame: ChessGameState;
  sudokuGame: SudokuGameState;
  error: string | null;

  // Actions
  startLoading: (gameType: GameType) => void;
  setChessGame: (game: ChessGameState) => void;
  setSudokuGame: (game: SudokuGameState) => void;
  setError: (message: string) => void;
  restMatch: () => void;
}

const initialState = {
  status: 'idle' as MatchStatus,
  gameType: null as GameType,
  chessGame: null,
  sudokuGame: null,
  error: null,
};

export const useMatchStore = create<MatchState>((set) => ({
  ...initialState,

  startLoading: (gameType) =>
    set({ chessGame: gameType, gameType: 'in_progress', error: null }),

  setChessGame: (game) =>
    set({ chessGame: game, status: 'in_progress', error: null }),

  setSudokuGame: (game) =>
    set({ sudokuGame: game, status: 'in_progress', error: null }),

  setError: (message) =>
    set({ status: 'error', error: message }),

  resetMatch: () =>
    set({ ...initialState }),
}));
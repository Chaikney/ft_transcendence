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
  updateCell: (row: number, col: number, value: number) => void;
  setError: (message: string) => void;
  resetMatch: () => void;
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
    set({ status: 'loading', gameType, error: null }),

  setChessGame: (game) =>
    set({ chessGame: game, status: 'in_progress', error: null }),

  setSudokuGame: (game) =>
    set({ sudokuGame: game, status: 'in_progress', error: null }),

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
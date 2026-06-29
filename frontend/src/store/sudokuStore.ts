import { create } from 'zustand';
import type { SudokuGameState } from '@/features/sudoku/types';

interface SudokuState {
  sudokuGame: SudokuGameState | null;
  status: 'idle' | 'loading' | 'active' | 'finished' | 'error';
  error: string | null;
  setSudokuGame: (game: SudokuGameState) => void;
  updateCell: (row: number, col: number, value: number) => void;
  startLoading: () => void;
  setError: (message: string) => void;
  resetSudoku: () => void;
}

export const useSudokuStore = create<SudokuState>((set) => ({
  sudokuGame: null,
  status: 'idle',
  error: null,
  
  startLoading: () => set({ status: 'loading', error: null }),
  
  setSudokuGame: (game) => set({ sudokuGame: game, status: 'active', error: null }),
  
  updateCell: (row, col, value) =>
    set((state) => {
      if (!state.sudokuGame) return state;
      const newGrid = state.sudokuGame.grid.map((r, rIdx) =>
        r.map((cell, cIdx) => (rIdx === row && cIdx === col ? value : cell))
      );
      return { sudokuGame: { ...state.sudokuGame, grid: newGrid } };
    }),
    
  setError: (message) => set({ status: 'error', error: message }),
  
  resetSudoku: () => set({ sudokuGame: null, status: 'idle', error: null }),
}));
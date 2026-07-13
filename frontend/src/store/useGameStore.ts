import { create } from 'zustand';
import type { GameData } from '../types'; // Asegura esta ruta

interface GameState {
  gameData: GameData | null;
  isLoading: boolean;
  
  // Acciones
  setGameData: (data: GameData) => void;
  updateGameData: (partial: Partial<GameData>) => void;
  setLoading: (loading: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameData: null,
  isLoading: true,

  setGameData: (data) => set({ gameData: data, isLoading: false }),

  // Esta función es crucial: mezcla los datos nuevos con los viejos
  updateGameData: (partial) => 
    set((state) => ({
      gameData: state.gameData ? { ...state.gameData, ...partial } : null
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  resetGame: () => set({ gameData: null, isLoading: true }),
}));
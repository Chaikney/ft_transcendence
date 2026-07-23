import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  // 👈 Añadimos la firma de la función
  setBanned: (banned: boolean) => void; 
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({ user, isAuthenticated: true, isLoading: false }),

  clearUser: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  // 🔨 Añadimos la ejecución de la función
  setBanned: (banned) =>
    set((state) => ({
      // Solo actualizamos si hay un usuario logueado. 
      // Ojo: asegúrate de que en tu type User la propiedad se llama `banned` (y no `is_banned`), 
      // ya que en tu App.tsx has escrito `user?.banned`
      user: state.user ? { ...state.user, banned } : null,
    })),
}));

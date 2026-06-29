import { create } from 'zustand';
import type { ConnectionStatusType } from '@/types';

interface RadarState {
  // Estado de TU conexión con el servidor (para el puntito de la navbar)
  status: ConnectionStatusType;
  setStatus: (status: ConnectionStatusType) => void;
  
  // Diccionario para saber qué usuarios están online (ID del usuario -> true/false)
  onlineUsers: Record<number, boolean>;
  updateUserStatus: (userId: number, isOnline: boolean) => void;
}

export const useRadarStore = create<RadarState>((set) => ({
  status: 'connecting', 
  setStatus: (status) => set({ status }),
  
  onlineUsers: {},
  updateUserStatus: (userId, isOnline) =>
    set((state) => ({
      onlineUsers: {
        ...state.onlineUsers,
        [userId]: isOnline,
      },
    })),
}));
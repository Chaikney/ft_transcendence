import { get } from '@/services/api';
import type { ChessGameState } from '@/features/chess/index';


export const gameService = {
  fetchGame: async (gameId: string): Promise<ChessGameState> => {
    const res = await get<ChessGameState>(`/games/${gameId}`);
    return res.data;
  },
};
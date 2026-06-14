import { get, post } from '@services/api';
import type { ChessGameState, ChessMovePayload } from '../chess/types';
// import type { ApiResponse } from '@/types';
import type { ApiResponse } from '@/types';

export const getChessGame = (game_id: string): Promise<ApiResponse<ChessGameState>> =>
  get<ChessGameState>(`/chess/games/${game_id}`); // Corregido: eliminado el ' extra

export const postChessMove = (payload: ChessMovePayload): Promise<ApiResponse<ChessGameState>> =>
  post<ChessGameState, ChessMovePayload>('/chess/move', payload);

export const postChessAIMove = (game_id: string): Promise<ApiResponse<ChessGameState>> =>
  post<ChessGameState, { game_id: string }>('/chess/ai_move', { game_id });
import { get, patch, post } from '@services/api';
import type { SudokuGameState, SudokuMovePayload } from '@/features/sudoku/types';
import type { ApiResponse } from '@/types';

export const getSudokuGame = (game_id: string): Promise<ApiResponse<SudokuGameState>> =>
  get<SudokuGameState>(`/sudoku/games/${game_id}`);

export const createSudokuGame = (difficulty = 'easy'): Promise<ApiResponse<SudokuGameState>> =>
  post<SudokuGameState, { difficulty: string }>('/sudoku/games', { difficulty });

export const postSudokuMove = (payload: SudokuMovePayload): Promise<ApiResponse<SudokuGameState>> =>
  patch<SudokuGameState, SudokuMovePayload>(`/sudoku/games/${payload.game_id}`, payload);
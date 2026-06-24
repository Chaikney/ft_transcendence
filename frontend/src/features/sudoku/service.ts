import { get, patch } from '@services/api';
import type { SudokuGameState, SudokuMovePayload } from '@/features/sudoku/types';
import type { ApiResponse } from '@/types';

export const getSudokuGame = (game_id: string): Promise<ApiResponse<SudokuGameState>> =>
  get<SudokuGameState>(`/sudoku/games/${game_id}`);

export const postSudokuMove = (payload: SudokuMovePayload): Promise<ApiResponse<SudokuGameState>> =>
  patch<SudokuGameState, SudokuMovePayload>(`/sudoku/games/${payload.game_id}`, payload);

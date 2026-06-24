export type CellValue = number | null;

export type SudokuDifficulty = 'easy' | 'medium' | 'hard';
export type SudokeStatus = 'active' | 'in_progress' | 'won' | 'lost';

export interface SudokuGameState {
	game_id: string;
	grid: number[][]; // 9x9 matrix
	difficulty: SudokuDifficulty;
	status: SudokeStatus;
}

export interface SudokuMovePayload {
	game_id: string;
	row: number;
	col: number;
	value: number;
  board: string;
}

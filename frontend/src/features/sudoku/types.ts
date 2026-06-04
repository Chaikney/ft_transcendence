export type CellValue = number | null;

export type SudokuDifficulty = 'easy' | 'medium' | 'hard';
export type SudokeStatus = 'active' | 'won' | 'lost';

export type ConnectionStatusType = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

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
}

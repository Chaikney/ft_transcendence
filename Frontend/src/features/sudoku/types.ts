export interface SudokuGameState {
	game_id: string;
	grid: number[][]; // 9x9 matrix
	difficulty: 'easy' | 'medium' | 'hard';
	status: 'active' | 'won' | 'lost';
}

export interface SudokuMovePlayload {
	game_id: string;
	row: number;
	col: number;
	value: number;
}
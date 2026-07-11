export type ConnectionStatusType = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface ChessGameState {
	game_id: string;
	fen: string;				//standar representation board
	turn: 'white' | 'black';
	status: 'active' | 'checkmate' | 'draw' | 'finished';
	last_move: ChessMove | null;
	player2_id?: number;
	player1_id?: number;
	white: string;
	black: string;
	spectators: number;
}

export interface ChessMove {
	from: string;	// ex: "e2"
	to: string;		// ex: "e4"
	piece: string;
}

export interface ChessMovePayload {
	game_id: string;
	from: string;
	to: string;
}

export interface LiveGame {
	id: string;
	type: 'chess' | 'sudoku';
	white: string;
	black: string;
	status: 'active' | 'checkmate' | 'draw';
	turn: 'white' | 'black';
	move_count: number;
	spectators: number;
	started_at: string;
}
export type ConnectionStatusType = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface ChessGameState {
	game_id: string;
	fen: string;				//standar representation board
	turn: 'white' | 'black';
	status: 'active' | 'checkmate' | 'draw' | 'finished';
	last_move: ChessMove | null;
	player2_id?: number;
	player1_id?: number;
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

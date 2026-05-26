export interface ChessGameState {
	gameId: string;
	fen: string;				//standar representation board
	turn: 'white' | 'black';
	status: 'active' | 'checkmate' | 'draw';
	last_move: ChessMove | null;
}

export interface ChessMove {
	from: string;	// ex: "e2"
	to: string;		// ex: "e4"
	piece: string;
}

export interface ChessMovePlayload {
	game_id: string;
	from: string;
	to: string;
}
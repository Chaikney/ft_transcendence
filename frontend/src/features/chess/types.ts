export type ConnectionStatusType = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface ChessGameState {
	game_id: string;
    fen: string;                
	turn: 'white' | 'black';
    status: 'active' | 'in_progress' | 'checkmate' | 'draw' | 'finished' | 'resigned'; 
	last_move: ChessMove | null;
	player2_id?: number;
	player1_id?: number;
    
    fen_history?: string[];
    player?: {
        player1: { name: string; avatar?: string; elo?: number };
        player2: { name: string; avatar?: string; elo?: number };
    };
}

export interface ChessMove {
	from: string;	// ex: "e2"
	to: string;		// ex: "e4"
	piece: string;
    promotion?: string; // Added for pawn promotion
}

export interface ChessMovePayload {
	game_id: string;
	from: string;
	to: string;
    promotion?: string; // Added for pawn promotion request
}

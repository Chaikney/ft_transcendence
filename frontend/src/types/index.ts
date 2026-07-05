export type ConnectionStatusType = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export interface User {
	id: number;
	username: string;
	elo: number;
	avatar_url: string;
  role?: number | string;
  banned?: boolean;
}

export interface GameData {
  game_id: string;
  fen: string;
  turn: 'white' | 'black';
  status: 'active' | 'checkmate' | 'draw';
  player: {
    player1: { name: string; avatar: string };
    player2: { name: string; avatar: string };
  };
  last_move: any;
}

export interface ApiResponse<T> {
	data: T;
	error?: string;
}

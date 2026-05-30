export interface User {
	id: number;
	username: string;
	elo: number;
}

export interface ApiResponse<T> {
	data: T;
	error?: string;
}

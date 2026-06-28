import  api  from '@/services/api';

export interface LeaderboardEntry {
  username: string;
  elo: number;
  wins: number;
  losses: number;
  avatar_url?: string;
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data } = await api.get('/leaderboard');
  return data;
};
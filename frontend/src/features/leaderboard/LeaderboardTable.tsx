import { useEffect, useState } from 'react';
import { getLeaderboard, LeaderboardEntry } from './api/leaderboardService';

export const LeaderboardTable = () => {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setUsers)
      .catch((err) => console.error("Error al cargar ranking:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="font-mono text-xs animate-pulse">Cargando datos...</div>;

  return (
    <div className="flex flex-col w-full font-mono text-xs">
      <div className="flex justify-between border-b border-white/20 pb-2 mb-2 text-text-muted">
        <span>USUARIO</span>
        <span>ELO</span>
      </div>
      
      {users.map((user, index) => (
        <div key={user.username} className="flex justify-between py-1 hover:text-accent transition-colors">
          <span className="truncate">
            {index + 1}. {user.username}
          </span>
          <span className="text-accent font-bold">{user.elo}</span>
        </div>
      ))}
    </div>
  );
};
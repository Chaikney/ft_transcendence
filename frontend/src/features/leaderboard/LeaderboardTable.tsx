import { useEffect, useState } from 'react';
import { getLeaderboard, LeaderboardEntry } from './api/leaderboardService';

export const LeaderboardTable = () => {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((data) => {
        // 🛡️ MAGIA 1: Nos aseguramos de guardar un Array. 
        // Si 'data' viene corrupto o vacío, guardamos [] para salvar el .map()
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        // 🛡️ MAGIA 2: Si el servidor da error (ej. el 401), lo atrapamos
        // y reseteamos el estado a un array vacío en silencio.
        //console.error("Error al cargar ranking:", err);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="font-mono text-xs animate-pulse text-accent">&gt; fetching_ranks...</div>;

  return (
    <div className="flex flex-col w-full font-mono text-xs">
      <div className="flex justify-between border-b border-border-strong pb-2 mb-2 text-text-muted tracking-widest uppercase">
        <span>USUARIO</span>
        <span>ELO</span>
      </div>
      
      {/* 🛡️ MAGIA 3: Renderizado condicional por si la lista está vacía */}
      {(users || []).length === 0 ? (
        <div className="py-6 text-center text-text-muted opacity-50">
          // no data available
        </div>
      ) : (
        (users || []).map((user, index) => (
          <div key={user.username} className="flex justify-between py-1 hover:text-accent hover:bg-accent/5 transition-colors duration-fast px-1 rounded-sm">
            <span className="truncate">
              <span className="text-text-muted mr-2">{index + 1}.</span> 
              {user.username}
            </span>
            <span className="text-accent font-bold drop-shadow-[0_0_5px_rgba(0,212,255,0.4)]">
              {user.elo}
            </span>
          </div>
        ))
      )}
    </div>
  );
};
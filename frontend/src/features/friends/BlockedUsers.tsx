import { useState, useEffect } from 'react';
import { get, post } from '@/services/api';
import { Avatar } from '@/components/Avatar';

interface BlockedUser {
  id: number;
  username: string;
  avatar_url: string | null;
  elo: number;
}

export const BlockedUsers = () => {
  const [blacklist, setBlacklist] = useState<BlockedUser[]>([]);
  const [isOpen, setIsOpen] = useState(false); // Por defecto colapsado para no estorbar

  // Cargamos la lista negra desde el nuevo endpoint del backend
  const fetchBlacklist = async () => {
    try {
      const response: any = await get('/friends/blacklist');
      if (response.blacklist) {
        setBlacklist(response.blacklist);
      }
    } catch (error) {
      console.error('Error al cargar la lista de bloqueados:', error);
    }
  };

  useEffect(() => {
    fetchBlacklist();
  }, []);

  // Función para amnistiar/desbloquear al usuario
  const handleUnblock = async (username: string, id: number) => {
    // UI Optimista: Lo quitamos de la lista al instante en el front
    setBlacklist((prev) => prev.filter((user) => user.id !== id));
    
    try {
      await post('/friends/unblock', { username });
    } catch (error) {
      console.error('Error al desbloquear al usuario:', error);
      // Si falla el servidor, recargamos la lista real para no dejar la UI rota
      fetchBlacklist();
    }
  };

  if (blacklist.length === 0) return null; // Si no hay bloqueados, la sección ni se muestra

  return (
    <div className="flex flex-col border-t border-[#1a1a24] bg-[#0c0c12]">
      {/* Botón/Cabecera desplegable */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2 hover:bg-[#14141f] transition-colors duration-200 w-full text-left"
      >
        <span className="text-[10px] font-mono tracking-widest uppercase text-red-500/70">
          {isOpen ? '▼' : '▶'} BLACKLIST_RECORDS ({blacklist.length})
        </span>
      </button>

      {/* Lista de caídos en combate */}
      {isOpen && (
        <div className="flex flex-col max-h-[200px] overflow-y-auto custom-scrollbar bg-[#08080c]">
          {blacklist.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between gap-3 px-4 py-2 border-b border-[#14141f]/50 hover:bg-[#120a0f] transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar 
                  username={user.username} 
                  size="sm" 
                  status="offline" // Forzamos offline porque nos da igual su estado si está bloqueado
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-mono text-gray-400 line-through group-hover:text-red-400 transition-colors truncate">
                    {user.username}
                  </span>
                  <span className="text-[9px] font-mono text-[#4a4a5a]">{user.elo || 1000} ELO</span>
                </div>
              </div>

              {/* Botón de Amnistía (Unblock) */}
              <button
                onClick={() => handleUnblock(user.username, user.id)}
                className="px-2 py-1 border border-red-900/40 text-red-500 font-mono text-[9px] uppercase tracking-wider hover:bg-red-950/30 hover:border-red-500 transition-all cursor-pointer"
                title="Desbloquear usuario"
              >
                UNBLOCK
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
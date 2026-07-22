import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { post, del } from '@/services/api';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import type { Friend } from '../chat/types';

const STATUS_CONFIG: Record<Friend['status'], { label: string; variant: 'success' | 'error' | 'warning' | 'muted' | 'info'; dot: boolean }> = {
  online:     { label: 'online',      variant: 'success', dot: true  },
  offline:    { label: 'offline',     variant: 'muted',   dot: false },
  in_game:    { label: 'in game',     variant: 'warning', dot: true  },
  spectating: { label: 'spectating',  variant: 'info',    dot: true  },
};

export const ActiveFriends = () => {
  const navigate = useNavigate();
  // ✂️ GUILLOTINA: Hemos quitado openChat, setActiveRoom y rooms del Store
  const { friends, removeFriend } = useChatStore();
  
  // 🛡️ ANTI-SPAM: Guardamos a quién hemos retado recientemente
  const [challengedIds, setChallengedIds] = useState<number[]>([]);
  const [cooldowns, setCooldowns] = useState<Record<number, boolean>>({});

  // 🛠️ FIX ELIMINAR: Borrado instantáneo (Optimistic UI)
  const handleRemoveFriend = async (friendUsername: string, friendId: number) => { 
    removeFriend(friendId); 
    try {
      await del('/friends/remove', { data: { username: friendUsername } });
    } catch (e) { 
     console.log ('El servidor falló al eliminar al amigo'); 
    }
  };

  // 🛠️ FIX BLOQUEAR: Borrado instantáneo y petición
  const handleBlockFriend = async (friendUsername: string, friendId: number) => {
    removeFriend(friendId); 
    try {
      await post('/friends/block', { username: friendUsername });
    } catch (e) { 
      console.log('El servidor falló al bloquear al usuario'); 
    }
  };

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
        <span className="text-[10px] font-mono text-[#4a4a5a]">// the void is empty</span>
        <span className="text-[#ff3366] text-[10px] font-mono animate-pulse">_</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {friends.map((friend) => {
        // 🚀 AQUÍ VAN TODAS LAS CONSTANTES: Fuera del JSX, antes del return
        const cfg = STATUS_CONFIG[friend.status] || STATUS_CONFIG['offline'];
        const isOnline = friend.status === 'online';
        const isCooldown = cooldowns[friend.id];

        // Ahora sí, devolvemos el HTML usando las variables limpiamente
        return (
          <div key={friend.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#1a1a24] transition-colors duration-200 hover:bg-[#121218] group">
            <Avatar
              username={friend.username}
              size="sm"
              status={friend.status === 'offline' ? 'offline' : friend.status === 'in_game' ? 'away' : 'online'}
            />

            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-xs font-mono text-gray-200 truncate">{friend.username}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#6a6a7a]">{friend.elo} ELO</span>
                <Badge variant={cfg.variant} dot={cfg.dot} size="sm">{cfg.label}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              
              <button onClick={() => navigate(`/profile/${friend.username}`)} className="text-[#6a6a7a] hover:text-white font-mono text-xs px-1" title="Profile">👤</button>
              <button onClick={() => handleRemoveFriend(friend.username, friend.id)} className="text-[#6a6a7a] hover:text-[#ff3366] font-mono text-xs px-1" title="Remove">✕</button>
              <button onClick={() => handleBlockFriend(friend.username, friend.id)} className="text-[#6a6a7a] hover:text-red-600 font-mono text-xs px-1" title="Block">🚫</button>
            
            </div>
          </div>
        );
      })}
    </div>
  );
};
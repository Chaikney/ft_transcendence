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
  const { friends, removeFriend, openChat, setActiveRoom, rooms } = useChatStore();

  // 🛠️ FIX MENSAJES: Si no hay sala, abrimos el chat global por defecto
  const handleOpenChat = async (friend: Friend) => {
    const existing = rooms.find(r => r.type === 'direct' && r.participants.some((p) => p.id === friend.id));
    
    if (existing) {
      setActiveRoom(existing.id);
      openChat();
    } else {
      // Si no existe la sala, abrimos el chat igualmente. 
      // NOTA FUTURA: Aquí deberías hacer un POST a tu backend para crear la sala DM.
      console.warn(`[CHAT] No tienes historial con ${friend.username}. Debes crear la sala DM.`);
      openChat(); 
    }
  };

  // 🛠️ FIX ELIMINAR: Borrado instantáneo (Optimistic UI)
  const handleRemoveFriend = async (friendUsername: string, friendId: number) => { 
    removeFriend(friendId); // Desaparece al instante de la pantalla
    try {
      await del('/friends/remove', { data: { username: friendUsername } });
    } catch (e) { 
      console.error('El servidor falló al eliminar al amigo', e); 
    }
  };

  // 🛠️ FIX BLOQUEAR: Borrado instantáneo y petición
  const handleBlockFriend = async (friendUsername: string, friendId: number) => {
    removeFriend(friendId); // Desaparece al instante de la pantalla
    try {
      await post('/friends/block', { username: friendUsername });
    } catch (e) { 
      console.error('El servidor falló al bloquear al usuario', e); 
    }
  };

  // 🛠️ FIX AJEDREZ: Aviso de sistema pendiente
  const handleChallenge = (friend: Friend) => {
    // Para que esto sea real, tu backend necesita un sistema de notificaciones.
    // Ej: cable.perform('send_challenge', { target: friend.id, game: 'chess' })
    alert(`[SISTEMA DE RETOS] Falta implementar la notificación WebSocket para invitar a ${friend.username} a jugar.`);
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
        const cfg = STATUS_CONFIG[friend.status] || STATUS_CONFIG['offline'];
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
              <button onClick={() => handleOpenChat(friend)} className="text-[#6a6a7a] hover:text-white font-mono text-xs px-1" title="Message">💬</button>
              <button onClick={() => navigate(`/profile/${friend.username}`)} className="text-[#6a6a7a] hover:text-white font-mono text-xs px-1" title="Profile">👤</button>
              {friend.status === 'online' && (
                <button onClick={() => handleChallenge(friend)} className="text-[#6a6a7a] hover:text-[#4ade80] font-mono text-xs px-1" title="Challenge">♟</button>
              )}
              <button onClick={() => handleRemoveFriend(friend.username, friend.id)} className="text-[#6a6a7a] hover:text-[#ff3366] font-mono text-xs px-1" title="Remove">✕</button>
              <button onClick={() => handleBlockFriend(friend.username, friend.id)} className="text-[#6a6a7a] hover:text-red-600 font-mono text-xs px-1" title="Block">🚫</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
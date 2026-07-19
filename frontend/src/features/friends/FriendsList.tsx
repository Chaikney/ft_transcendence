import { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { get } from '@/services/api';

// Sub-componentes
import { UserSearch } from './UserSearch';
import { PendingRequests } from './PendingRequests';
import { ActiveFriends } from './ActiveFriends';
import { BlockedUsers } from './BlockedUsers'; // 🚀 IMPORTAMOS LA BLACKLIST

export const FriendsList = () => {
  const { friends, setFriends, setFriendRequests } = useChatStore();

  useEffect(() => {
    const fetchFriendsData = async () => {
      try {
        const response: any = await get('/friends');
        
        if (response.friends) setFriends(response.friends);
        
        if (response.pending_requests && setFriendRequests) {
            const mappedRequests = response.pending_requests.map((user: any) => ({
                id: `req_${user.id}`, 
                from: {
                    id: user.id,
                    username: user.username,
                    avatar: user.avatar,
                    elo: user.elo || 1000
                },
                timestamp: new Date().toISOString()
            }));
            setFriendRequests(mappedRequests);
        }
      } catch (error) {
        //console.error('Error cargando la red de contactos:', error);
      }
    };

    fetchFriendsData();
  }, [setFriends, setFriendRequests]);

  const onlineCount = friends.filter((f) => f.status !== 'offline').length;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] border-l border-[#1a1a24]">
      {/* Cabecera */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a24] bg-[#0d0d14]">
        <span className="text-[10px] font-mono tracking-widest uppercase text-[#6a6a7a]">&gt; Friends</span>
        <span className="text-[10px] font-mono text-[#ff3366]">
          {onlineCount}/{friends.length} actv
        </span>
      </div>

      {/* Contenido (con scroll si hay muchos amigos o bloqueados) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <PendingRequests />
        <ActiveFriends />
        <BlockedUsers /> {/* 🚀 LA BLACKLIST SE ACOMODA AQUÍ ABAJO */}
      </div>

      {/* Buscador fijo abajo */}
      <UserSearch />
    </div>
  );
};
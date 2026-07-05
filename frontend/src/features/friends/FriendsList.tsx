import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { get, post, patch, del } from '@/services/api';
import type { Friend, FriendRequest } from '../chat/types';

// ── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<Friend['status'], {
  label:    string;
  variant:  'success' | 'error' | 'warning' | 'muted' | 'info';
  dot:      boolean;
}> = {
  online:      { label: 'online',      variant: 'success', dot: true  },
  offline:     { label: 'offline',     variant: 'muted',   dot: false },
  in_game:     { label: 'in game',     variant: 'warning', dot: true  },
  spectating:  { label: 'spectating',  variant: 'info',    dot: true  },
};

// ── Styles ────────────────────────────────────────────────────────────────
const s = {
  wrapper: 'flex flex-col gap-0',
  sectionHeader: 'flex items-center justify-between px-4 py-2 border-b border-border-strong',
  sectionTitle: 'text-[10px] font-mono tracking-widest uppercase text-text-muted',
  sectionCount: 'text-[10px] font-mono text-accent',
  requestsBanner: 'flex flex-col gap-2 px-4 py-3 border-b border-border bg-accent-bg',
  requestsTitle: 'text-[10px] font-mono tracking-widest uppercase text-accent',
  requestRow: 'flex items-center gap-2',
  requestName: 'text-xs font-mono text-text-primary flex-1',
  requestActions: 'flex items-center gap-1',
  friendRow: 'flex items-center gap-3 px-4 py-2.5 border-b border-border transition-colors duration-base hover:bg-bg-elevated group',
  friendInfo: 'flex flex-col gap-0.5 flex-1 min-w-0',
  friendName: 'text-xs font-mono text-text-primary truncate',
  friendElo: 'text-[10px] font-mono text-text-muted',
  friendActions: 'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
  addFriendRow: 'flex items-center gap-2 px-4 py-3 border-t border-border-strong',
  addInput: 'flex-1 bg-bg-base border border-border text-text-primary font-mono text-xs px-2 py-1.5 outline-none focus:border-accent transition-all placeholder:text-text-muted',
  addBtn: 'text-accent font-mono text-xs cursor-pointer hover:text-accent-hover transition-colors px-1 flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed',
  empty: 'flex flex-col items-center justify-center gap-2 py-8 px-4 text-center',
  emptyText: 'text-[10px] font-mono text-text-muted',
  emptyCursor: 'text-accent text-[10px] font-mono animate-blink',
} as const;

export const FriendsList = () => {
  const navigate    = useNavigate();
  // const currentUser = useAuthStore((s) => s.user); // Descomenta si necesitas validar algo del propio usuario

  const {
    friends,
    friendRequests,
    setFriends,
    setFriendRequests, // <-- Asumo que tienes esto en tu Zustand para cargar las peticiones iniciales
    removeFriend,
    removeFriendRequest,
    openChat,
    setActiveRoom,
    rooms,
  } = useChatStore();

  // 🚀 LA CONEXIÓN REAL: Cargar amigos de la base de datos al montar el componente
  useEffect(() => {
    const fetchFriendsData = async () => {
      try {
        // Hacemos un bypass de TypeScript con 'any' para evitar conflictos con tu ApiResponse
        const response: any = await get('/friends');
        
        // Actualizamos Zustand con la sangre fresca de la BD
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
        console.error('Error cargando la red de contactos:', error);
      }
    };

    fetchFriendsData();
  }, [setFriends, setFriendRequests]);

  // ── Handlers con Fuego Real ────────────────────────────────────────────────────────────

  const handleAcceptRequest = async (req: FriendRequest) => {
    try {
      await patch('/friends/accept', { username: req.from.username }); 
      removeFriendRequest(req.id);
      
      // Opcional: Podrías hacer un fetchFriendsData() aquí de nuevo para refrescar la lista,
      // o añadirlo manualmente a Zustand si no quieres hacer otra petición.
      // fetchFriendsData(); 
    } catch {
      console.error('Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (req: FriendRequest) => {
    try {
      await del('/friends/reject', { data: { username: req.from.username } }); 
      removeFriendRequest(req.id);
    } catch {
      console.error('Failed to decline friend request');
    }
  };

  const handleRemoveFriend = async (friendUsername: string, friendId: number) => { 
    try {
      await del('/friends/reject', { data: { username: friendUsername } }); 
      removeFriend(friendId);
    } catch {
      console.error('Failed to remove friend');
    }
  };

  const handleBlockFriend = async (friendUsername: string, friendId: number) => {
    try {
        await post('/friends/block', { username: friendUsername });
        removeFriend(friendId);
    } catch {
        console.error('Failed to block user');
    }
  };

  const handleOpenChat = (friend: Friend) => {
    const existing = rooms.find(
      (r) =>
        r.type === 'direct' &&
        r.participants.some((p) => p.id === friend.id)
    );
    if (existing) {
      setActiveRoom(existing.id);
      openChat();
    }
  };

  const handleAddFriend = async (username: string) => {
    if (!username.trim()) return;
    try {
      await post('/friends/request', { username });
      // Aquí podrías mostrar un Toast de éxito (ej: `success("Petición enviada a ${username}")`)
    } catch {
      console.error('Failed to send friend request');
      // Podrías mostrar un Toast de error aquí
    }
  };

  const onlineCount = friends.filter((f) => f.status !== 'offline').length;

  return (
    <div className={s.wrapper}>

      <div className={s.sectionHeader}>
        <span className={s.sectionTitle}>&gt; friends_list</span>
        <span className={s.sectionCount}>
          {onlineCount}/{friends.length} online
        </span>
      </div>

      {friendRequests.length > 0 && (
        <div className={s.requestsBanner}>
          <span className={s.requestsTitle}>
            {friendRequests.length} pending request{friendRequests.length > 1 ? 's' : ''}
          </span>
          {friendRequests.map((req) => (
            <div key={req.id} className={s.requestRow}>
              <Avatar username={req.from.username} size="sm" />
              <span className={s.requestName}>{req.from.username}</span>
              <div className={s.requestActions}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAcceptRequest(req)}
                >
                  ✓
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeclineRequest(req)}
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends list */}
      {friends.length === 0 ? (
        <div className={s.empty}>
          <span className={s.emptyText}>// no friends yet</span>
          <span className={s.emptyCursor}>_</span>
        </div>
      ) : (
        friends.map((friend) => {
          const cfg = STATUS_CONFIG[friend.status] || STATUS_CONFIG['offline']; // Fallback por si acaso
          return (
            <div key={friend.id} className={s.friendRow}>

              <Avatar
                username={friend.username}
                size="sm"
                status={
                  friend.status === 'offline' ? 'offline' :
                  friend.status === 'in_game' ? 'away' : 'online'
                }
              />

              <div className={s.friendInfo}>
                <span className={s.friendName}>{friend.username}</span>
                <div className="flex items-center gap-2">
                  <span className={s.friendElo}>{friend.elo} ELO</span>
                  <Badge variant={cfg.variant} dot={cfg.dot} size="sm">
                    {cfg.label}
                  </Badge>
                </div>
              </div>

              {/* Hover actions */}
              <div className={s.friendActions}>
                {/* Message */}
                <button
                  onClick={() => handleOpenChat(friend)}
                  className="text-text-muted hover:text-accent font-mono text-xs px-1 transition-colors"
                  title="Send message"
                  aria-label={`Message ${friend.username}`}
                >
                  💬
                </button>

                {/* View profile */}
                <button
                  onClick={() => navigate(`/profile/${friend.username}`)}
                  className="text-text-muted hover:text-accent font-mono text-xs px-1 transition-colors"
                  title="View profile"
                  aria-label={`View ${friend.username}'s profile`}
                >
                  👤
                </button>

                {/* Challenge to game */}
                {friend.status === 'online' && (
                  <button
                    onClick={() =>
                      navigate(`/game/chess/chess-${friend.id}`)
                    }
                    className="text-text-muted hover:text-accent font-mono text-xs px-1 transition-colors"
                    title="Challenge to chess"
                    aria-label={`Challenge ${friend.username} to chess`}
                  >
                    ♟
                  </button>
                )}

                {/* Remove friend */}
                <button
                  onClick={() => handleRemoveFriend(friend.username, friend.id)}
                  className="text-text-muted hover:text-status-error font-mono text-xs px-1 transition-colors"
                  title="Remove friend"
                  aria-label={`Remove ${friend.username} from friends`}
                >
                  ✕
                </button>

                {/* Block friend */}
                <button
                  onClick={() => handleBlockFriend(friend.username, friend.id)}
                  className="text-text-muted hover:text-[#ff3366] font-mono text-xs px-1 transition-colors"
                  title="Block User"
                  aria-label={`Block ${friend.username}`}
                >
                  🚫
                </button>
              </div>

            </div>
          );
        })
      )}

      {/* Add friend input */}
      <div className={s.addFriendRow}>
        <input
          type="text"
          className={s.addInput}
          placeholder="> add_friend(username)"
          maxLength={30}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddFriend((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = '';
            }
          }}
          aria-label="Add friend by username"
        />
        <span className={s.addBtn}>↵</span>
      </div>

    </div>
  );
};
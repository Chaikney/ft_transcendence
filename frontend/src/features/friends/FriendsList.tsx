import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { post } from '@/services/api';
import type { Friend, FriendRequest } from '../chat/types';

// ── Mock loader ────────────────────────────────────────────────────────────
const loadMockFriends = async () => {
  const { mockFriends } = await import('../../mocks/chat.mock');
  return mockFriends;
};

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
  wrapper:
    'flex flex-col gap-0',

  sectionHeader:
    'flex items-center justify-between px-4 py-2 ' +
    'border-b border-border-strong',
  sectionTitle:
    'text-[10px] font-mono tracking-widest uppercase text-text-muted',
  sectionCount:
    'text-[10px] font-mono text-accent',

  requestsBanner:
    'flex flex-col gap-2 px-4 py-3 border-b border-border ' +
    'bg-accent-bg',
  requestsTitle:
    'text-[10px] font-mono tracking-widest uppercase text-accent',
  requestRow:
    'flex items-center gap-2',
  requestName:
    'text-xs font-mono text-text-primary flex-1',
  requestActions:
    'flex items-center gap-1',

  friendRow:
    'flex items-center gap-3 px-4 py-2.5 ' +
    'border-b border-border transition-colors duration-base ' +
    'hover:bg-bg-elevated group',
  friendInfo:
    'flex flex-col gap-0.5 flex-1 min-w-0',
  friendName:
    'text-xs font-mono text-text-primary truncate',
  friendElo:
    'text-[10px] font-mono text-text-muted',
  friendActions:
    'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',

  addFriendRow:
    'flex items-center gap-2 px-4 py-3 border-t border-border-strong',
  addInput:
    'flex-1 bg-bg-base border border-border text-text-primary ' +
    'font-mono text-xs px-2 py-1.5 outline-none ' +
    'focus:border-accent transition-all placeholder:text-text-muted',
  addBtn:
    'text-accent font-mono text-xs cursor-pointer ' +
    'hover:text-accent-hover transition-colors px-1 flex-shrink-0 ' +
    'disabled:opacity-30 disabled:cursor-not-allowed',

  empty:
    'flex flex-col items-center justify-center gap-2 py-8 px-4 text-center',
  emptyText:
    'text-[10px] font-mono text-text-muted',
  emptyCursor:
    'text-accent text-[10px] font-mono animate-blink',
} as const;

export const FriendsList = () => {
  const navigate    = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const isMock      = import.meta.env.VITE_USE_MOCK === 'true';

  const {
    friends,
    friendRequests,
    setFriends,
    addFriend,
    removeFriend,
    removeFriendRequest,
    openChat,
    setActiveRoom,
    rooms,
  } = useChatStore();

  // Load mock friends
  useEffect(() => {
    if (!isMock) return;
    loadMockFriends().then(setFriends);
  }, []);

  const handleAcceptRequest = async (req: FriendRequest) => {
    if (isMock) {
      addFriend({
        id:       req.from.id,
        username: req.from.username,
        elo:      req.from.elo,
        status:   'online',
        since:    new Date().toISOString(),
      });
      removeFriendRequest(req.id);
      return;
    }
    try {
      await post(`/friends/${req.id}/accept`, {});
      removeFriendRequest(req.id);
    } catch {
      console.error('Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (req: FriendRequest) => {
    if (isMock) {
      removeFriendRequest(req.id);
      return;
    }
    try {
      await post(`/friends/${req.id}/decline`, {});
      removeFriendRequest(req.id);
    } catch {
      console.error('Failed to decline friend request');
    }
  };

  const handleRemoveFriend = async (userId: number) => {
    if (isMock) {
      removeFriend(userId);
      return;
    }
    try {
      await post(`/friends/${userId}/remove`, {});
      removeFriend(userId);
    } catch {
      console.error('Failed to remove friend');
    }
  };

  const handleOpenChat = (friend: Friend) => {
    // Find or create DM room with this friend
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
    if (isMock) {
      console.log('[MOCK] Friend request sent to', username);
      return;
    }
    try {
      await post('/friends/request', { username });
    } catch {
      console.error('Failed to send friend request');
    }
  };

  const onlineCount  = friends.filter((f) => f.status !== 'offline').length;

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
          const cfg = STATUS_CONFIG[friend.status];
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
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="text-text-muted hover:text-status-error font-mono text-xs px-1 transition-colors"
                  title="Remove friend"
                  aria-label={`Remove ${friend.username} from friends`}
                >
                  ✕
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
import { useChatStore } from '@/store/chatStore';
import { patch, del } from '@/services/api';
import { Avatar } from '@/components/Avatar';

export const PendingRequests = () => {
  const { friendRequests, removeFriendRequest } = useChatStore();

  if (friendRequests.length === 0) return null;

  const handleAccept = async (username: string, id: number) => {
    try {
      await patch('/friends/accept', { username });
      removeFriendRequest(id);
      // Nota: Aquí el estado de amigos se actualizará cuando hagas reload, 
      // o podrías disparar el fetchFriendsData() desde el padre.
    } catch (e) {
      //console.error('Failed to accept');
    }
  };

  const handleReject = async (username: string, id: number) => {
    try {
      await del('/friends/reject', { data: { username } });
      removeFriendRequest(id);
    } catch (e) {
      //console.error('Failed to reject');
    }
  };

  return (
    <div className="flex flex-col gap-2 px-4 py-3 border-b border-[#1a1a24] bg-[#140b10]">
      <span className="text-[10px] font-mono tracking-widest uppercase text-[#ff3366]">
        [{friendRequests.length}] pending_souls
      </span>
      {friendRequests.map((req) => (
        <div key={req.id} className="flex items-center gap-3 py-1">
          <Avatar username={req.from.username} size="sm" />
          <span className="text-xs font-mono text-gray-200 flex-1">{req.from.username}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAccept(req.from.username, req.id)}
              className="text-[#4ade80] hover:text-white hover:scale-110 font-mono transition-all"
              title="Accept"
            >✓</button>
            <button
              onClick={() => handleReject(req.from.username, req.id)}
              className="text-[#ff3366] hover:text-white hover:scale-110 font-mono transition-all"
              title="Reject"
            >✕</button>
          </div>
        </div>
      ))}
    </div>
  );
};
import { create } from 'zustand';
import type {
  ChatMessage,
  ChatRoom,
  Friend,
  FriendRequest,
} from '../features/chat/types';

interface ChatState {
  rooms:           ChatRoom[];
  activeRoomId:    string | null;
  messages:        Record<string, ChatMessage[]>;
  friends:         Friend[];
  friendRequests:  FriendRequest[];
  typingUsers:     Record<string, string[]>;
  isOpen:          boolean;
  unreadTotal:     number;

  setRooms:            (rooms: ChatRoom[]) => void;
  setActiveRoom:       (roomId: string | null) => void;
  addMessage:          (roomId: string, msg: ChatMessage) => void;
  setMessages:         (roomId: string, msgs: ChatMessage[]) => void;
  markRoomRead:        (roomId: string) => void;
  setFriends:          (friends: Friend[]) => void;
  setFriendRequests:   (requests: FriendRequest[]) => void;
  setFriendOnline:     (userId: number, online: boolean) => void;
  setFriendInGame:     (userId: number) => void;
  addFriendRequest:    (req: FriendRequest) => void;
  removeFriendRequest: (id: number) => void;
  addFriend:           (friend: Friend) => void;
  removeFriend:        (userId: number) => void;
  setTyping:           (roomId: string, username: string, typing: boolean) => void;
  toggleChat:          () => void;
  openChat:            () => void;
  closeChat:           () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms:          [],
  activeRoomId:   null,
  messages:       {},
  friends:        [],
  friendRequests: [],
  typingUsers:    {},
  isOpen:         false,
  unreadTotal:    0,

  setRooms: (rooms) =>
    set({
      rooms,
      unreadTotal: rooms.reduce((acc, r) => acc + r.unread_count, 0),
    }),

  setActiveRoom: (roomId) => {
    set({ activeRoomId: roomId });
    if (roomId) get().markRoomRead(roomId);
  },

  addMessage: (roomId, msg) =>
    set((state) => {
      const existing = state.messages[roomId] ?? [];
      if (existing.find((m) => m.id === msg.id)) return state;
      const rooms = state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              last_message: msg,
              unread_count:
                state.activeRoomId === roomId ? 0 : r.unread_count + 1,
            }
          : r
      );
      return {
        messages:    { ...state.messages, [roomId]: [...existing, msg] },
        rooms,
        unreadTotal: rooms.reduce((acc, r) => acc + r.unread_count, 0),
      };
    }),

  setMessages: (roomId, msgs) =>
    set((state) => ({
      messages: { ...state.messages, [roomId]: msgs },
    })),

  markRoomRead: (roomId) =>
    set((state) => {
      const rooms = state.rooms.map((r) =>
        r.id === roomId ? { ...r, unread_count: 0 } : r
      );
      return {
        rooms,
        unreadTotal: rooms.reduce((acc, r) => acc + r.unread_count, 0),
      };
    }),

  setFriends: (friends) => set({ friends }),
  
  setFriendRequests: (requests) => set({ friendRequests: requests }),

  setFriendOnline: (userId, online) =>
    set((state) => ({
      friends: state.friends.map((f) =>
        f.id === userId
          ? { ...f, status: online ? 'online' : 'offline' }
          : f
      ),
    })),

  setFriendInGame: (userId) =>
    set((state) => ({
      friends: state.friends.map((f) =>
        f.id === userId ? { ...f, status: 'in_game' } : f
      ),
    })),

  addFriendRequest: (req) =>
    set((state) => ({
      friendRequests: [...state.friendRequests, req],
    })),

  removeFriendRequest: (id) =>
    set((state) => ({
      friendRequests: state.friendRequests.filter((r) => r.id !== id),
    })),

  addFriend: (friend) =>
    set((state) => ({
      friends: [...state.friends, friend],
    })),

  removeFriend: (userId) =>
    set((state) => ({
      friends: state.friends.filter((f) => f.id !== userId),
    })),

  setTyping: (roomId, username, typing) =>
    set((state) => {
      const current = state.typingUsers[roomId] ?? [];
      const updated = typing
        ? [...new Set([...current, username])]
        : current.filter((u) => u !== username);
      return {
        typingUsers: { ...state.typingUsers, [roomId]: updated },
      };
    }),

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat:   () => set({ isOpen: true }),
  closeChat:  () => set({ isOpen: false }),
}));
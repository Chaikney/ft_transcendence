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

  // Updates the list of chat rooms and recalculates the total unread message count.
  setRooms: (rooms) =>
    set({
      rooms,
      unreadTotal: rooms.reduce((acc, r) => acc + r.unread_count, 0),
    }),

  // Sets the currently active conversation and marks its unread messages as read.
  setActiveRoom: (roomId) => {
    set({ activeRoomId: roomId });
    if (roomId) get().markRoomRead(roomId);
  },

  // Appends a new message to a specific room and updates its last message and unread count.
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

  // Overwrites the message history for a specific room.
  setMessages: (roomId, msgs) =>
    set((state) => ({
      messages: { ...state.messages, [roomId]: msgs },
    })),

  // Resets the unread count for a specific room to zero.
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

  // Replaces the entire list of friends.
  setFriends: (friends) => set({ friends }),

  // Updates the online/offline status of a specific friend.
  setFriendOnline: (userId, online) =>
    set((state) => ({
      friends: state.friends.map((f) =>
        f.id === userId
          ? { ...f, status: online ? 'online' : 'offline' }
          : f
      ),
    })),

  // Sets a friend's status to in-game.
  setFriendInGame: (userId) =>
    set((state) => ({
      friends: state.friends.map((f) =>
        f.id === userId ? { ...f, status: 'in_game' } : f
      ),
    })),

  // Adds a new pending friend request.
  addFriendRequest: (req) =>
    set((state) => ({
      friendRequests: [...state.friendRequests, req],
    })),

  // Removes a friend request by ID.
  removeFriendRequest: (id) =>
    set((state) => ({
      friendRequests: state.friendRequests.filter((r) => r.id !== id),
    })),

  // Adds a friend to the friends list.
  addFriend: (friend) =>
    set((state) => ({
      friends: [...state.friends, friend],
    })),

  // Removes a friend from the friends list by user ID.
  removeFriend: (userId) =>
    set((state) => ({
      friends: state.friends.filter((f) => f.id !== userId),
    })),

  // Adds or removes a username from the typing indicators of a room.
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

  // Switches the chat window open/closed state.
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  // Explicitly opens the chat window.
  openChat:   () => set({ isOpen: true }),
  // Explicitly closes the chat window.
  closeChat:  () => set({ isOpen: false }),
}));
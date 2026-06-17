export interface ChatMessage {
  id:         string;
  content:    string;
  sender_id:  number;
  sender:     string;
  room_id:    string;
  created_at: string;
  read:       boolean;
}

export interface ChatRoom {
  id:           string;
  type:         'direct' | 'group';
  name?:        string;
  participants: ChatParticipant[];
  last_message: ChatMessage | null;
  unread_count: number;
  created_at:   string;
}

export interface ChatParticipant {
  id:       number;
  username: string;
  elo:      number;
  online:   boolean;
}

export type SendMessagePayload = {
  room_id: string;
  content: string;
};

// Real-time presence indicator
export type FriendStatus = 'online' | 'offline' | 'in_game' | 'spectating';

export interface Friend {
  id:       number;
  username: string;
  elo:      number;
  status:   FriendStatus;
  since:    string;
}

export interface FriendRequest {
  id:         number;
  from:       ChatParticipant;
  created_at: string;
}

// Discriminated union for type-safe "WebSocket event" handling
export type ChatChannelEvent =
  | { type: 'message_received';    message:  ChatMessage }
  | { type: 'message_read';        room_id:  string; user_id: number }
  | { type: 'user_online';         user_id:  number; username: string }
  | { type: 'user_offline';        user_id:  number; username: string }
  | { type: 'friend_request';      request:  FriendRequest }
  | { type: 'friend_accepted';     friend:   Friend }
  | { type: 'typing_start';        room_id:  string; username: string }
  | { type: 'typing_stop';         room_id:  string; username: string };
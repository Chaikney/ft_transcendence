import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useChatChannel } from '@/hooks/useChatChannel';
import { Avatar } from '../../components/Avatar';
import { onForbidden } from '../../services/api';
import { get } from '../../services/api';
import type { ChatMessage } from './types';

// ── Types ──────────────────────────────────────────────────────────────────
interface DirectRoom {
  friendId:   number;
  friendName: string;
  online:     boolean;
  unread:     number;
}

// ── Mock loader ────────────────────────────────────────────────────────────
const loadMockData = async () => {
  const { mockChatRooms, mockMessages } = await import('../../mocks/chat.mock');
  return { mockChatRooms, mockMessages };
};

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

const getRoomKey = (friendId: number) => String(friendId);

// ── Styles ────────────────────────────────────────────────────────────────
const s = {
  panel:
    'fixed bottom-20 right-6 z-[900] flex flex-col ' +
    'w-80 h-[480px] ' +
    'bg-bg-surface border border-border-strong ' +
    'shadow-[0_0_32px_rgba(0,212,255,0.12),0_8px_48px_rgba(0,0,0,0.8)] ' +
    'animate-fade-in',
  bracketTL:
    'absolute top-[-1px] left-[-1px] w-3 h-3 ' +
    'border-t-2 border-l-2 border-accent pointer-events-none z-10',
  bracketBR:
    'absolute bottom-[-1px] right-[-1px] w-3 h-3 ' +
    'border-b-2 border-r-2 border-accent pointer-events-none z-10',
  header:
    'flex items-center justify-between px-4 py-2 ' +
    'border-b border-border-strong flex-shrink-0',
  headerTitle:
    'text-[10px] font-mono tracking-widest uppercase text-text-secondary',
  headerClose:
    'text-text-muted hover:text-accent font-mono text-xs cursor-pointer transition-colors',
  body:
    'flex flex-1 overflow-hidden',
  roomList:
    'w-24 flex-shrink-0 border-r border-border flex flex-col overflow-y-auto',
  roomItem:
    'flex flex-col items-center gap-1 px-1 py-2 cursor-pointer ' +
    'border-b border-border transition-colors',
  roomItemActive:  'bg-accent-bg border-l-2 border-l-accent',
  roomItemInactive: 'hover:bg-bg-elevated',
  roomName:
    'text-[9px] font-mono text-center truncate w-full px-1',
  roomUnread:
    'w-4 h-4 rounded-full flex items-center justify-center ' +
    'text-[8px] font-mono font-bold',
  msgArea:    'flex-1 flex flex-col overflow-hidden',
  msgHeader:
    'px-3 py-1.5 border-b border-border flex items-center gap-2 flex-shrink-0',
  msgHeaderName:
    'text-[10px] font-mono text-text-secondary flex-1 truncate',
  msgList:
    'flex-1 overflow-y-auto flex flex-col gap-1 px-3 py-2',
  msgRow:         'flex flex-col gap-0.5 max-w-[90%]',
  msgRowOwn:      'self-end items-end',
  msgRowOther:    'self-start items-start',
  msgBubble:
    'px-3 py-1.5 text-[11px] font-mono leading-relaxed break-words max-w-full',
  msgMeta:        'text-[9px] font-mono text-text-muted px-1',
  typingRow:
    'px-3 py-1 flex items-center gap-1.5 flex-shrink-0',
  typingDot:      'w-1 h-1 rounded-full bg-text-muted',
  typingText:     'text-[9px] font-mono text-text-muted',
  inputRow:
    'flex items-center gap-2 px-3 py-2 border-t border-border flex-shrink-0',
  input:
    'flex-1 bg-bg-base border border-border text-text-primary ' +
    'font-mono text-xs px-2 py-1.5 outline-none ' +
    'focus:border-accent focus:shadow-[0_0_6px_rgba(0,212,255,0.2)] ' +
    'placeholder:text-text-muted transition-all',
  sendBtn:
    'text-accent hover:text-accent-hover font-mono text-xs cursor-pointer ' +
    'transition-colors px-1 flex-shrink-0 ' +
    'disabled:opacity-30 disabled:cursor-not-allowed',
  empty:
    'flex-1 flex flex-col items-center justify-center gap-2 text-center px-4',
  emptyText:  'text-[10px] font-mono text-text-muted leading-relaxed',
  emptyAccent: 'text-accent text-[10px] font-mono animate-blink',
  blockedBanner:
    'mx-3 mb-2 px-3 py-2 text-[10px] font-mono border ' +
    'border-status-error/30 bg-status-error-bg text-status-error',
} as const;

// ── Component ──────────────────────────────────────────────────────────────
export const ChatPanel = () => {
  const currentUser = useAuthStore((s) => s.user);
  const isMock      = import.meta.env.VITE_USE_MOCK === 'true';

  const {
    messages,
    typingUsers,
    setMessages,
    closeChat,
    markRoomRead,
  } = useChatStore();

  // ── Local state ───────────────────────────────────────────────────────
  const [rooms,          setRooms]          = useState<DirectRoom[]>([]);
  const [activeFriendId, setActiveFriendId] = useState<number | null>(null);
  const [input,          setInput]          = useState('');
  const [isTyping,       setIsTyping]       = useState(false);
  const [blocked,        setBlocked]        = useState(false);
  const [loadingMsgs,    setLoadingMsgs]    = useState(false);

  const msgEndRef      = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef       = useRef<HTMLInputElement>(null);

  // ── WebSocket — subscribed per active friend ──────────────────────────
  const { sendMessage, sendTyping } = useChatChannel(activeFriendId);

  // ── Load initial room list ────────────────────────────────────────────
  useEffect(() => {
    if (isMock) {
      loadMockData().then(({ mockChatRooms, mockMessages }) => {
        const mapped: DirectRoom[] = mockChatRooms.map((r) => {
          const other = r.participants.find((p) => p.id !== currentUser?.id);
          return {
            friendId:   other?.id   ?? 0,
            friendName: other?.username ?? 'unknown',
            online:     other?.online   ?? false,
            unread:     r.unread_count,
          };
        });
        setRooms(mapped);
        // Load mock messages keyed by friendId
        mockChatRooms.forEach((r) => {
          const other = r.participants.find((p) => p.id !== currentUser?.id);
          if (other && mockMessages[r.id]) {
            setMessages(String(other.id), mockMessages[r.id]);
          }
        });
        setActiveFriendId(mapped[0]?.friendId ?? null);
      });
      return;
    }

    // Real: GET /api/users (friends list doubles as room list)
    get<{ id: number; username: string; online: boolean }[]>('/users')
      .then((res) => {
        const mapped: DirectRoom[] = res.data.map((u) => ({
          friendId:   u.id,
          friendName: u.username,
          online:     u.online,
          unread:     0,
        }));
        setRooms(mapped);
        if (mapped.length > 0) setActiveFriendId(mapped[0].friendId);
      })
      .catch(console.error);
  }, [currentUser?.id]);

  // ── Load message history when active friend changes ───────────────────
  useEffect(() => {
    if (!activeFriendId) return;
    setBlocked(false);

    const roomKey = getRoomKey(activeFriendId);
    markRoomRead(roomKey);

    if (isMock) return; // mock messages already loaded above

    setLoadingMsgs(true);
    get<ChatMessage[]>(`/messages/history/${activeFriendId}`)
      .then((res) => {
        setMessages(roomKey, res.data);
      })
      .catch((err) => {
        if (err.response?.status === 403) setBlocked(true);
        console.error('[ChatPanel] history fetch failed:', err);
      })
      .finally(() => setLoadingMsgs(false));

  }, [activeFriendId]);

  // ── Listen for global 403 forbidden events ────────────────────────────
  useEffect(() => {
    const unsubscribe = onForbidden((detail) => {
      if (detail.blocked_id === activeFriendId) {
        setBlocked(true);
      }
    });
    return unsubscribe;
  }, [activeFriendId]);

  // ── Scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeFriendId]);

  // ── Focus input on room change ────────────────────────────────────────
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeFriendId]);

  // ── Derived ───────────────────────────────────────────────────────────
  const roomKey        = activeFriendId ? getRoomKey(activeFriendId) : null;
  const activeMessages = roomKey ? (messages[roomKey] ?? []) : [];
  const typingInRoom   = roomKey ? (typingUsers[roomKey] ?? [])   : [];
  const activeRoom     = rooms.find((r) => r.friendId === activeFriendId);

  // ── Send ──────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!input.trim() || !activeFriendId || !currentUser || blocked) return;

    const content = input.trim();
    setInput('');

    clearTimeout(typingTimerRef.current);
    if (isTyping) {
      sendTyping(false);
      setIsTyping(false);
    }

    if (isMock) {
      // Optimistic update in mock mode only
      useChatStore.getState().addMessage(getRoomKey(activeFriendId), {
        id:         `msg-${Date.now()}`,
        content,
        sender_id:  currentUser.id,
        sender:     currentUser.username,
        room_id:    getRoomKey(activeFriendId),
        created_at: new Date().toISOString(),
        read:       true,
      });
      return;
    }

    // Real: POST /api/messages — WS broadcast echoes back
    await sendMessage(content);

  }, [input, activeFriendId, currentUser, blocked, isMock, isTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!activeFriendId || isMock) return;
    if (!isTyping) {
      sendTyping(true);
      setIsTyping(true);
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTyping(false);
      setIsTyping(false);
    }, 2000);
  };

  const handleSelectRoom = (friendId: number) => {
    setActiveFriendId(friendId);
    setInput('');
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={s.panel}>
      <span className={s.bracketTL} aria-hidden />
      <span className={s.bracketBR} aria-hidden />

      {/* Header */}
      <div className={s.header}>
        <span className={s.headerTitle}>&gt; chat_client</span>
        <span
          className={s.headerClose}
          onClick={closeChat}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && closeChat()}
          aria-label="Close chat"
        >
          ✕
        </span>
      </div>

      <div className={s.body}>

        {/* Room list */}
        <div className={s.roomList}>
          {rooms.map((room) => {
            const isActive = room.friendId === activeFriendId;
            return (
              <div
                key={room.friendId}
                className={[
                  s.roomItem,
                  isActive ? s.roomItemActive : s.roomItemInactive,
                ].join(' ')}
                onClick={() => handleSelectRoom(room.friendId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleSelectRoom(room.friendId)
                }
                aria-label={`Chat with ${room.friendName}`}
                aria-pressed={isActive}
              >
                <Avatar
                  username={room.friendName}
                  size="sm"
                  status={room.online ? 'online' : 'offline'}
                />
                <span
                  className={s.roomName}
                  style={{ color: isActive ? '#00d4ff' : '#4a9eca' }}
                >
                  {room.friendName}
                </span>
                {room.unread > 0 && (
                  <span
                    className={s.roomUnread}
                    style={{ background: '#6c63ff', color: '#fff' }}
                  >
                    {room.unread > 9 ? '9+' : room.unread}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Message area */}
        <div className={s.msgArea}>
          {!activeRoom ? (
            <div className={s.empty}>
              <span className={s.emptyText}>// select a conversation</span>
              <span className={s.emptyAccent}>_</span>
            </div>
          ) : (
            <>
              {/* Room header */}
              <div className={s.msgHeader}>
                <span className={s.msgHeaderName}>
                  #{activeRoom.friendName}
                </span>
                {activeRoom.online && (
                  <span
                    style={{
                      width: '6px', height: '6px',
                      borderRadius: '50%',
                      background:  '#00ff88',
                      boxShadow:   '0 0 4px #00ff88',
                      display:     'inline-block',
                      flexShrink:  0,
                    }}
                  />
                )}
              </div>

              {/* Blocked banner */}
              {blocked && (
                <div className={s.blockedBanner}>
                  // messaging unavailable — block is active between
                  you and {activeRoom.friendName}
                </div>
              )}

              {/* Messages */}
              <div className={s.msgList} role="log" aria-live="polite">
                {loadingMsgs && (
                  <div className={s.empty}>
                    <span className={s.emptyText}>// loading history...</span>
                  </div>
                )}
                {!loadingMsgs && activeMessages.length === 0 && (
                  <div className={s.empty}>
                    <span className={s.emptyText}>// no messages yet</span>
                  </div>
                )}
                {activeMessages.map((msg) => {
                  const isOwn = msg.sender_id === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={[
                        s.msgRow,
                        isOwn ? s.msgRowOwn : s.msgRowOther,
                      ].join(' ')}
                    >
                      <div
                        className={[
                          s.msgBubble,
                          isOwn ? 'text-bg-base' : 'text-text-primary',
                        ].join(' ')}
                        style={{
                          background: isOwn ? '#00d4ff' : '#0a1628',
                          border:     isOwn ? 'none' : '1px solid #0d2d4a',
                        }}
                      >
                        {msg.content}
                      </div>
                      <span className={s.msgMeta}>
                        {!isOwn && `${msg.sender} · `}
                        {fmtTime(msg.created_at)}
                      </span>
                    </div>
                  );
                })}
                <div ref={msgEndRef} />
              </div>

              {/* Typing indicator */}
              {typingInRoom.length > 0 && (
                <div className={s.typingRow}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={s.typingDot}
                      style={{
                        animation: `pulse 1s ${i * 0.2}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                  <span className={s.typingText}>
                    {typingInRoom.join(', ')} typing...
                  </span>
                </div>
              )}

              {/* Input */}
              <div className={s.inputRow}>
                <input
                  ref={inputRef}
                  type="text"
                  className={s.input}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    blocked
                      ? '// messaging blocked'
                      : '> type message...'
                  }
                  disabled={blocked}
                  maxLength={500}
                  aria-label="Message input"
                />
                <button
                  className={s.sendBtn}
                  onClick={handleSend}
                  disabled={!input.trim() || blocked}
                  aria-label="Send message"
                >
                  ↵
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
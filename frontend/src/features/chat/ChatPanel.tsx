import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useChatChannel } from '@/hooks/useChatChannel';
import { Avatar } from '@/components/Avatar';
import api from '@/services/api';
import type { ChatRoom } from './types';

interface ChatPanelProps {
  sendMessage: (roomId: string, content: string) => void;
  sendTyping: (roomId: string, typing: boolean) => void;
}

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const s = {
  panel:
    'fixed z-[900] flex flex-col ' +
    // Mobile: casi toda la pantalla, con margen arriba (navbar) y abajo (botón de chat)
    'inset-x-3 top-16 bottom-20 ' +
    // Desktop (sm+): vuelve al tamaño y posición originales
    'sm:inset-x-auto sm:top-auto sm:bottom-20 sm:right-6 ' +
    'sm:w-80 sm:h-[480px] ' +
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
    'flex flex-col items-center gap-1 px-1 py-2 cursor-pointer border-b border-border transition-colors',
  roomItemActive:
    'bg-accent-bg border-l-2 border-l-accent',
  roomItemInactive:
    'hover:bg-bg-elevated',
  roomName:
    'text-[9px] font-mono text-center truncate w-full px-1',
  roomUnread:
    'w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-mono font-bold',
  msgArea:
    'flex-1 flex flex-col overflow-hidden',
  msgHeader:
    'px-3 py-1.5 border-b border-border flex items-center gap-2 flex-shrink-0',
  msgHeaderName:
    'text-[10px] font-mono text-text-secondary flex-1 truncate',
  msgList:
    'flex-1 overflow-y-auto flex flex-col gap-1 px-3 py-2',
  msgRow:
    'flex flex-col gap-0.5 max-w-[90%]',
  msgRowOwn:
    'self-end items-end',
  msgRowOther:
    'self-start items-start',
  msgBubble:
    'px-3 py-1.5 text-[11px] font-mono leading-relaxed break-words max-w-full',
  msgBubbleOwn:
    'text-bg-base',
  msgBubbleOther:
    'text-text-primary',
  msgMeta:
    'text-[9px] font-mono text-text-muted px-1',
  typingRow:
    'px-3 py-1 flex items-center gap-1.5 flex-shrink-0',
  typingDot:
    'w-1 h-1 rounded-full bg-text-muted',
  typingText:
    'text-[9px] font-mono text-text-muted',
  inputRow:
    'flex items-center gap-2 px-3 py-2 border-t border-border flex-shrink-0',
  input:
    'flex-1 bg-bg-base border border-border text-text-primary ' +
    'font-mono text-xs px-2 py-1.5 outline-none ' +
    'focus:border-accent focus:shadow-[0_0_6px_rgba(0,212,255,0.2)] ' +
    'placeholder:text-text-muted transition-all',
  sendBtn:
    'text-accent hover:text-accent-hover font-mono text-xs cursor-pointer ' +
    'transition-colors px-1 flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed',
  empty:
    'flex-1 flex flex-col items-center justify-center gap-2 text-center px-4',
  emptyText:
    'text-[10px] font-mono text-text-muted leading-relaxed',
  emptyAccent:
    'text-accent text-[10px] font-mono animate-blink',
} as const;

export const ChatPanel = ({ sendMessage, sendTyping }: ChatPanelProps) => {
  const currentUser = useAuthStore((s) => s.user);
  
  const {
    rooms, activeRoomId, messages, typingUsers,
    setRooms, setMessages, setActiveRoom, closeChat,
  } = useChatStore();

  const [input,    setInput]    = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const msgEndRef               = useRef<HTMLDivElement>(null);
  const typingTimerRef          = useRef<ReturnType<typeof setTimeout>>();
  const inputRef                = useRef<HTMLInputElement>(null);

  // 1. Fetch de Salas al montar
  useEffect(() => {
    api.get('/rooms')
      .then((res) => setRooms(res.data))
      .catch((err) => console.error('Error fetching rooms:', err));
  }, []);

  // 2. Fetch de Mensajes al cambiar de sala
  useEffect(() => {
    if (!activeRoomId) return;
    
    api.get(`/rooms/${activeRoomId}/messages`)
      .then((res) => setMessages(activeRoomId, res.data))
      .catch((err) => console.error('Error fetching messages:', err));
  }, [activeRoomId, setMessages]);

  // Auto-scroll
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoomId]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeRoomId]);

  const activeRoom     = rooms.find((r) => r.id === activeRoomId);
  const activeMessages = activeRoomId ? (messages[activeRoomId] ?? []) : [];
  const typingInRoom   = activeRoomId ? (typingUsers[activeRoomId] ?? []) : [];

  const handleSend = useCallback(() => {
    if (!input.trim() || !activeRoomId || !currentUser) return;

    sendMessage(activeRoomId, input.trim());
    setInput('');
    clearTimeout(typingTimerRef.current);
    if (isTyping) {
      sendTyping(activeRoomId, false);
      setIsTyping(false);
    }
  }, [input, activeRoomId, currentUser, isTyping, sendMessage, sendTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!activeRoomId) return;
    
    if (!isTyping) {
      sendTyping(activeRoomId, true);
      setIsTyping(true);
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTyping(activeRoomId, false);
      setIsTyping(false);
    }, 2000);
  };

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === 'group') return room.name ?? 'Group';
    const other = room.participants.find((p) => p.id !== currentUser?.id);
    return other?.username ?? 'Chat';
  };

  return (
    <div className={s.panel}>
      <span className={s.bracketTL} aria-hidden />
      <span className={s.bracketBR} aria-hidden />

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
        <div className={s.roomList}>
          {rooms.map((room) => {
            const isActive  = room.id === activeRoomId;
            const name      = getRoomDisplayName(room);
            const otherUser = room.type === 'direct'
              ? room.participants.find((p) => p.id !== currentUser?.id)
              : null;

            return (
              <div
                key={room.id}
                className={[
                  s.roomItem,
                  isActive ? s.roomItemActive : s.roomItemInactive,
                ].join(' ')}
                onClick={() => setActiveRoom(room.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveRoom(room.id)}
                aria-label={`Chat with ${name}`}
                aria-pressed={isActive}
              >
                <Avatar
                  username={name}
                  size="sm"
                  status={otherUser?.online ? 'online' : 'offline'}
                />
                <span
                  className={s.roomName}
                  style={{ color: isActive ? '#00d4ff' : '#4a9eca' }}
                >
                  {name}
                </span>
                {room.unread_count > 0 && (
                  <span
                    className={s.roomUnread}
                    style={{ background: '#6c63ff', color: '#fff' }}
                  >
                    {room.unread_count > 9 ? '9+' : room.unread_count}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className={s.msgArea}>
          {!activeRoom ? (
            <div className={s.empty}>
              <span className={s.emptyText}>// select a conversation</span>
              <span className={s.emptyAccent}>_</span>
            </div>
          ) : (
            <>
              <div className={s.msgHeader}>
                <span className={s.msgHeaderName}>
                  #{getRoomDisplayName(activeRoom)}
                </span>
                {activeRoom.participants.find(
                  (p) => p.id !== currentUser?.id
                )?.online && (
                  <span
                    style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#00ff88', boxShadow: '0 0 4px #00ff88',
                      display: 'inline-block', flexShrink: 0,
                    }}
                  />
                )}
              </div>

              <div className={s.msgList} role="log" aria-live="polite">
                {activeMessages.length === 0 && (
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
                          isOwn ? s.msgBubbleOwn : s.msgBubbleOther,
                        ].join(' ')}
                        style={{
                          background: isOwn ? '#00d4ff' : '#0a1628',
                          border:     isOwn ? 'none' : '1px solid #0d2d4a',
                        }}
                      >
                        {msg.content}
                      </div>
                      <span className={s.msgMeta}>
                        {!isOwn && (
                          <>
                            {/* Lógica: Si es string lo usamos directo, si es objeto buscamos .username */}
                            {typeof msg.sender === 'string' 
                              ? msg.sender 
                              : msg.sender?.username ?? 'Unknown'
                            } · 
                          </>
                        )}
                        {fmtTime(msg.created_at)}
                      </span>
                    </div>
                  );
                })}
                <div ref={msgEndRef} />
              </div>

              {typingInRoom.length > 0 && (
                <div className={s.typingRow}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={s.typingDot}
                      style={{ animation: `pulse 1s ${i * 0.2}s ease-in-out infinite` }}
                    />
                  ))}
                  <span className={s.typingText}>
                    {typingInRoom.join(', ')} typing...
                  </span>
                </div>
              )}

              <div className={s.inputRow}>
                <input
                  ref={inputRef}
                  type="text"
                  className={s.input}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="> type message..."
                  maxLength={500}
                  aria-label="Message input"
                />
                <button
                  className={s.sendBtn}
                  onClick={handleSend}
                  disabled={!input.trim()}
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
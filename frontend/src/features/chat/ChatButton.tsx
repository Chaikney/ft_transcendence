import { useChatStore } from '@/store/chatStore';
import { ChatPanel } from './ChatPanel';
import { useChatChannel } from '@/hooks/useChatChannel';

const s = {
  wrapper:
    'fixed bottom-6 right-6 z-[900] flex flex-col items-end gap-3',
  btn:
    'relative w-12 h-12 flex items-center justify-center ' +
    'border-2 cursor-pointer transition-all duration-base select-none',
  btnClosed:
    'bg-bg-surface border-accent-border text-accent ' +
    'hover:bg-accent hover:text-bg-base ' +
    'hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]',
  btnOpen:
    'bg-accent border-accent text-bg-base ' +
    'shadow-[0_0_16px_rgba(0,212,255,0.4)]',
  icon:
    'font-mono text-lg leading-none',
  badge:
    'absolute -top-2 -right-2 min-w-[18px] h-[18px] ' +
    'flex items-center justify-center ' +
    'rounded-full text-[9px] font-mono font-bold text-white ' +
    'border-2 border-bg-base',
} as const;

export const ChatButton = () => {
  const { isOpen, unreadTotal, toggleChat } = useChatStore();

  const { sendMessage, sendTyping } = useChatChannel();

  return (
    <div className={s.wrapper}>
      {isOpen && (
        <ChatPanel 
          sendMessage={sendMessage} 
          sendTyping={sendTyping} 
        />
      )}
      <button
        className={[s.btn, isOpen ? s.btnOpen : s.btnClosed].join(' ')}
        onClick={toggleChat}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        <span className={s.icon}>{isOpen ? '✕' : '💬'}</span>
        {!isOpen && unreadTotal > 0 && (
          <span
            className={s.badge}
            style={{ background: '#ff3366' }}
            aria-label={`${unreadTotal} unread messages`}
          >
            {unreadTotal > 9 ? '9+' : unreadTotal}
          </span>
        )}
      </button>
    </div>
  );
};

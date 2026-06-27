import { useState } from 'react';
import { useMatchStore, useAuthStore } from '@/store';

interface LobbyProps {
  onAccept: () => void;
  isConnected: boolean;
}

export const LobbyScreen = ({ onAccept, isConnected }: LobbyProps) => {
  const [isReady, setIsReady] = useState(false);
  const currentUser = useAuthStore((s) => s.user);
  const opponent = useMatchStore((s) => s.opponent);

  const handleAcceptMatch = () => {
    if (!isConnected) return;
    setIsReady(true);
    onAccept();
  };

  if (!currentUser || !opponent) return null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
      <div className="mt-20 h-16 flex items-center justify-center">
        {!isReady ? (
          <button 
            onClick={handleAcceptMatch}
            disabled={!isConnected}
            className={`relative px-12 py-4 border font-mono text-sm tracking-[0.2em] uppercase transition-all duration-300 group overflow-hidden ${isConnected ? 'border-accent text-accent hover:bg-accent hover:text-bg-base' : 'border-gray-500 text-gray-500 cursor-wait'}`}
          >
            <div className="absolute inset-0 w-full h-full bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
            <span className="relative z-10">
              {isConnected ? '> Accept Match _' : '> Connecting... _'}
            </span>
          </button>
        ) : (
          <div className="text-accent font-mono text-sm tracking-[0.2em] uppercase animate-pulse flex gap-2 items-center">
            <span className="w-2 h-2 bg-accent rounded-full animate-ping" />
            Waiting for opponent...
          </div>
        )}
      </div>
    </div>
  );
};
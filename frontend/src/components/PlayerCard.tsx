import { Avatar } from '@/components/Avatar';

interface PlayerProps {
  name: string;
  // 🚀 FIX: Le ponemos el '?' para que acepte que a veces pueda venir 'undefined'
  elo?: number; 
  avatar?: string;
  isTurn: boolean;
}

export const PlayerCard = ({ name, elo, avatar, isTurn }: PlayerProps) => {
  return (
    <div className={`flex items-center gap-4 p-3 border-2 transition-colors duration-300 w-full max-w-sm ${
      isTurn ? 'border-[#00ff88] bg-[#00ff88]/5' : 'border-[#1a1a24] bg-[#0c0c12]'
    }`}>
      <Avatar username={name} size="md" status="online" src={avatar} />
      
      <div className="flex flex-col min-w-0">
        <span className="text-lg font-mono text-gray-200 uppercase tracking-wider truncate">
          {name}
        </span>
        <span className={`text-xs font-mono ${isTurn ? 'text-[#00ff88]' : 'text-[#6a6a7a]'}`}>
          {/* 🚀 FIX: Si no hay ELO (undefined), mostramos '???' por seguridad */}
          ELO: {elo ?? '???'}
        </span>
      </div>

      {isTurn && (
        <span className="ml-auto text-[10px] font-mono text-[#00ff88] animate-pulse uppercase">
          &gt; THINKING...
        </span>
      )}
    </div>
  );
};
import { Avatar } from '@/components/Avatar';

interface PlayerProps {
  name: string;
  elo?: number;
  avatar?: string;
  isTurn: boolean;
  align?: 'left' | 'right'; // 🚀 NUEVO: Controla la orientación de la tarjeta
}

export const PlayerCard = ({ name, elo, avatar, isTurn, align = 'left' }: PlayerProps) => {
  const isRight = align === 'right';

  return (
    <div className={`flex items-center gap-4 p-3 border-2 transition-colors duration-300 w-full max-w-sm ${
      isRight ? 'flex-row-reverse text-right' : 'text-left'
    } ${
      isTurn ? 'border-[#00ff88] bg-[#00ff88]/5' : 'border-[#1a1a24] bg-[#0c0c12]'
    }`}>
      
      {/* El Avatar cambiará de lado automáticamente gracias a flex-row-reverse */}
      <Avatar username={name} src={avatar} size="md" status="online" />
      
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-lg font-mono text-gray-200 uppercase tracking-wider truncate">
          {name}
        </span>
        <span className={`text-xs font-mono ${isTurn ? 'text-[#00ff88]' : 'text-[#6a6a7a]'}`}>
          ELO: {elo ?? '???'}
        </span>
      </div>

      {/* El texto de carga también se ajusta de dirección */}
      {isTurn && (
        <span className={`text-[10px] font-mono text-[#00ff88] animate-pulse uppercase ${
          isRight ? 'mr-auto' : 'ml-auto'
        }`}>
          {isRight ? 'THINKING... <' : '> THINKING...'}
        </span>
      )}
    </div>
  );
};
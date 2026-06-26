import { useState } from 'react'; // 👈 Asegúrate de tener useState
import { useMatchStore, useAuthStore } from '@/store';

// 👇 AQUÍ ESTÁ EL FIX: Le decimos a TypeScript que vamos a recibir onAccept
export const LobbyScreen = ({ onAccept }: { onAccept: () => void }) => {
  const [isReady, setIsReady] = useState(false);
  const currentUser = useAuthStore((s) => s.user);
  const opponent = useMatchStore((s) => s.opponent);
  const gameType = useMatchStore((s) => s.gameType);

  const handleAcceptMatch = () => {
    setIsReady(true);
    onAccept(); // 👈 Ejecutamos la señal al backend
  };

  if (!currentUser || !opponent) return null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
      
      {/* ... TODO TU DISEÑO FRUTIGER AERO / CYBER DEL VS ... */}

      {/* Y EL BOTÓN ABAJO DEL TODO TIENE QUE ESTAR ASÍ: */}
      <div className="mt-20 h-16 flex items-center justify-center">
        {!isReady ? (
          <button 
            onClick={handleAcceptMatch}
            className="relative px-12 py-4 border border-accent text-accent font-mono text-sm tracking-[0.2em] uppercase hover:bg-accent hover:text-bg-base transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
            <span className="relative z-10">&gt; Accept Match _</span>
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
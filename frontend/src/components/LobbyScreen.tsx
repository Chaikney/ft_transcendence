import { useMatchStore, useAuthStore } from '@/store';

export const LobbyScreen = () => {
  const currentUser = useAuthStore((s) => s.user);
  const opponent = useMatchStore((s) => s.opponent);
  const gameType = useMatchStore((s) => s.gameType);

  // Esta función pasará del lobby al juego real
  const handleAcceptMatch = () => {
    useMatchStore.setState({ status: 'in_progress' });
  };

  if (!currentUser || !opponent) return null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
      
      {/* Fondo glitchy sutil */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('/path-to-noise.png')] mix-blend-overlay" />

      <h1 className="text-accent font-mono text-xl uppercase tracking-[0.3em] mb-12 animate-pulse">
        [ Match Found ]
      </h1>

      <div className="flex items-center justify-center gap-12 w-full max-w-4xl relative z-10">
        
        {/* JUGADOR 1 (TÚ) */}
        <div className="flex flex-col items-center gap-4 w-64">
          <div className="w-32 h-32 border border-accent/40 bg-bg-base shadow-[0_0_20px_rgba(0,212,255,0.2)] flex items-center justify-center rotate-45 group transition-all duration-500 hover:rotate-0">
            <div className="-rotate-45 group-hover:rotate-0 transition-transform duration-500 text-3xl font-bold font-mono text-text-primary">
              P1
            </div>
          </div>
          <div className="text-center mt-4">
            <h2 className="text-2xl font-mono text-text-primary tracking-widest uppercase">{currentUser.username}</h2>
            <p className="text-accent font-mono text-xs tracking-widest">ELO: {currentUser.elo}</p>
          </div>
        </div>

        {/* VS SEPARATOR */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-6xl font-mono font-bold text-status-error tracking-tighter opacity-80" style={{ textShadow: '0 0 20px rgba(255,51,102,0.5)' }}>
            VS
          </span>
          <span className="text-text-muted font-mono text-[10px] tracking-widest uppercase mt-4 border border-border-strong px-2 py-1">
            {gameType} protocol
          </span>
        </div>

        {/* JUGADOR 2 (RIVAL) */}
        <div className="flex flex-col items-center gap-4 w-64">
          <div className="w-32 h-32 border border-status-error/40 bg-bg-base shadow-[0_0_20px_rgba(255,51,102,0.2)] flex items-center justify-center rotate-45 group transition-all duration-500 hover:rotate-0">
            <div className="-rotate-45 group-hover:rotate-0 transition-transform duration-500 text-3xl font-bold font-mono text-status-error">
              P2
            </div>
          </div>
          <div className="text-center mt-4">
            <h2 className="text-2xl font-mono text-text-primary tracking-widest uppercase">{opponent.username}</h2>
            <p className="text-status-error font-mono text-xs tracking-widest">ELO: {opponent.elo}</p>
          </div>
        </div>

      </div>

      {/* BOTÓN DE ACEPTAR */}
      <div className="mt-20">
        <button 
          onClick={handleAcceptMatch}
          className="relative px-12 py-4 border border-accent text-accent font-mono text-sm tracking-[0.2em] uppercase hover:bg-accent hover:text-bg-base transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
          <span className="relative z-10">&gt; Accept Match _</span>
        </button>
      </div>

    </div>
  );
};
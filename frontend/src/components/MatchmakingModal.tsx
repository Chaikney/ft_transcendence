import { useMatchStore } from '@/store';

export const MatchmakingModal = () => {
  const status = useMatchStore((s) => s.status);
  const gameType = useMatchStore((s) => s.gameType);
  const resetMatch = useMatchStore((s) => s.resetMatch);

  // Si no estamos buscando partida, no mostramos nada
  if (status !== 'loading') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-base/80 backdrop-blur-md">
      <div className="relative border border-accent/40 bg-bg-base p-8 shadow-[0_0_30px_rgba(0,212,255,0.15)] max-w-sm w-full mx-4 flex flex-col items-center">
        
        {/* Línea de escáner superior animada */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-accent animate-pulse" />
        
        <h2 className="text-accent font-mono text-lg uppercase tracking-widest mb-8 text-center font-bold">
          [ System.Matchmaking ]
        </h2>
        
        <div className="flex flex-col items-center justify-center gap-6 w-full">
          {/* Círculo de radar girando */}
          <div className="w-16 h-16 border-2 border-accent/20 border-t-accent rounded-full animate-spin shadow-[0_0_15px_rgba(0,212,255,0.3)]" />
          
          <div className="text-center w-full">
            <p className="text-text-primary font-mono tracking-widest text-sm mb-2 animate-pulse">
              Scanning network...
            </p>
            <div className="border border-border-strong bg-bg-base/50 p-2 font-mono text-xs mt-4">
              <span className="text-text-muted">Target Protocol: </span>
              <span className="text-accent font-bold uppercase tracking-wider">{gameType}</span>
            </div>
          </div>

          <button 
            onClick={() => resetMatch()}
            className="mt-6 px-8 py-2 border border-status-error text-status-error font-mono text-xs tracking-widest uppercase hover:bg-status-error hover:text-bg-base transition-colors duration-300 w-full"
          >
            &gt; Abort Sequence
          </button>
        </div>
      </div>
    </div>
  );
};
import { useParams, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react'; // 👈 IMPORTANTE: Añadimos useEffect y useState
import { ChessBoard } from './ChessBoard';
import { useChessGame } from './hooks/useChessGame';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { InlineLoader, Button } from '@/components';
import { TerminalCard } from '@/components/TerminalCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useMatchStore, useAuthStore } from '@/store';
import { LobbyScreen } from '@/components/LobbyScreen';

const styles = {
  page: 'min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6',
  topBar: 'flex items-center justify-between w-full max-w-[520px]',
  gameId: 'text-xs font-mono text-text-muted tracking-widest truncate',
  actionRow: 'flex items-center justify-center gap-3 w-full',
} as const;

export const ChessGamePage = () => {
  const { id: gameId } = useParams<{ id: string }>();

  const { chessGame, sendMove, requestAIMove, connectionStatus, sendReady, claimDraw } = useChessGame(gameId || "");

  const status = useMatchStore((s) => s.status);
  const error = useMatchStore((s) => s.error);
  const resetMatch = useMatchStore((s) => s.resetMatch);
  const currentUser = useAuthStore((s) => s.user);

  // 🛡️ EL BLINDAJE CONTRA LA AMNESIA:
  // Guardamos tu color en un estado fijo.
  const [localColor, setLocalColor] = useState<'w' | 'b'>('w');

  useEffect(() => {
    // Solo calculamos el color si el servidor nos manda el ID del jugador 2 (al principio de la partida).
    // Si en los siguientes turnos el servidor olvida mandar el ID, este useEffect no hará nada,
    // ¡y tú seguirás conservando tu color correctamente!
    if (chessGame?.player2_id && currentUser?.id) {
      const p2 = String(chessGame.player2_id);
      const me = String(currentUser.id);
      setLocalColor(p2 === me ? 'b' : 'w');
    }
  }, [chessGame?.player2_id, currentUser?.id]);

  const isLocked = connectionStatus !== 'connected';

  if (!gameId) return <Navigate to="/" replace />;
  if (error) return <div className={styles.page}><ErrorMessage title="Failed to load game" message={error} onRetry={resetMatch} /></div>;
  if (status === 'lobby') return <LobbyScreen onAccept={sendReady} isConnected={connectionStatus === 'connected'} />;
  if (!chessGame) return <div className={styles.page}><InlineLoader label="Connecting to game..." /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <ConnectionStatus status={connectionStatus} />
        <span className={styles.gameId}>#{gameId}</span>
      </div>

      <TerminalCard
        title={`chess — game_${gameId}`}
        status={(chessGame?.status || 'unknown').toUpperCase()} // 👈 Cambio seguro
        statusVariant={chessGame?.status === 'active' ? 'active' : 'error'} // 👈 Cambio seguro
        maxWidth="max-w-[560px]"
      >
        <div className="flex flex-col items-center gap-5">
          <ChessBoard
            gameState={chessGame}
            onMove={sendMove}
            onDraw={claimDraw}
            disabled={isLocked}
            localPlayerColor={localColor} // 👈 Pasamos tu color blindado
          />
          <div className={styles.actionRow}>
            <Button variant="primary" onClick={requestAIMove} disabled={isLocked || chessGame.status !== 'active'}>
              Request AI move
            </Button>
            <Button variant="ghost" size="sm" onClick={resetMatch}>
              New game
            </Button>
          </div>
        </div>
      </TerminalCard>
    </div>
  );
};

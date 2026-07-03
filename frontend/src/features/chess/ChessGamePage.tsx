import { useParams, Navigate, useNavigate } from 'react-router-dom'; // 👈 Añadido useNavigate
import { useEffect, useState } from 'react';
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
  const navigate = useNavigate(); // 👈 Inicializamos el navegador

  const { chessGame, sendMove, resign, connectionStatus, sendReady, claimDraw } = useChessGame(gameId || "");

  const status = useMatchStore((s) => s.status);
  const error = useMatchStore((s) => s.error);
  const resetMatch = useMatchStore((s) => s.resetMatch);
  const currentUser = useAuthStore((s) => s.user);

  // 🛡️ EL BLINDAJE CONTRA LA AMNESIA:
  const [localColor, setLocalColor] = useState<'w' | 'b'>('w');

  // 🏳️ CONTROL DE BOTÓN ÚNICO:
  const [isResigning, setIsResigning] = useState(false); // 👈 Nuevo estado

  useEffect(() => {
    if (chessGame?.player2_id && currentUser?.id) {
      const p2 = String(chessGame.player2_id);
      const me = String(currentUser.id);
      setLocalColor(p2 === me ? 'b' : 'w');
    }
  }, [chessGame?.player2_id, currentUser?.id]);

  // 🚪 LA PUERTA DE SALIDA
  const handleNewGame = () => {
    resetMatch();
    navigate('/');
  };

  // 🏳️ MANEJADOR DE RENDICIÓN
  const handleResignClick = () => {
    if (isResigning) return; // Si ya se está procesando, ignoramos clics extra
    setIsResigning(true);    // Bloqueamos instantáneamente el botón en local
    resign();                // Enviamos la señal al backend
  };

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
        status={(chessGame?.status || 'unknown').toUpperCase()}
        statusVariant={chessGame?.status === 'active' ? 'active' : 'error'}
        maxWidth="max-w-[560px]"
      >
        <div className="flex flex-col items-center gap-5">
          <ChessBoard
            gameState={chessGame}
            onMove={sendMove}
            onDraw={claimDraw}
            disabled={isLocked}
            localPlayerColor={localColor}
          />
          <div className={styles.actionRow}>
            <Button
              variant="primary"
              onClick={handleResignClick}
              disabled={isLocked || isResigning || (chessGame.status !== 'active' && chessGame.status !== 'in_progress')}
            >
              {isResigning ? 'Resigning...' : 'Resign'}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleNewGame}>
              New game
            </Button>

          </div>
        </div>
      </TerminalCard>
    </div>
  );
};

import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ChessBoard } from './ChessBoard';
import { useChessGame } from './hooks/useChessGame';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { InlineLoader, Button } from '@/components';
import { TerminalCard } from '@/components/TerminalCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useMatchStore, useAuthStore } from '@/store'; 
import { LobbyScreen } from '@/components/LobbyScreen'; 

// 🚀 AÑADIDO: Importamos la tarjeta
import { PlayerCard } from '@/components/PlayerCard'; 

const styles = {
  page: 'min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6',
  topBar: 'flex items-center justify-between w-full max-w-[520px]',
  gameId: 'text-xs font-mono text-text-muted tracking-widest truncate',
  actionRow: 'flex items-center justify-center gap-3 w-full mt-4',
} as const;

export const ChessGamePage = () => {
  const { id: gameId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { chessGame, sendMove, resign, connectionStatus, sendReady, claimDraw } = useChessGame(gameId || "");
  
  const status = useMatchStore((s) => s.status); 
  const error = useMatchStore((s) => s.error);
  const resetMatch = useMatchStore((s) => s.resetMatch);
  const currentUser = useAuthStore((s) => s.user);

  const [localColor, setLocalColor] = useState<'w' | 'b'>('w');
  const [isResigning, setIsResigning] = useState(false);

  useEffect(() => {
    // Revisamos si el backend nos ha mandado ya los datos del player2
    if (chessGame?.player2_id && currentUser?.id) {
      const p2 = String(chessGame.player2_id);
      const me = String(currentUser.id);
      setLocalColor(p2 === me ? 'b' : 'w');
    }
  }, [chessGame?.player2_id, currentUser?.id]);

  const handleNewGame = () => {
    resetMatch(); 
    navigate('/'); 
  };

  const handleResignClick = () => {
    if (isResigning) return;
    setIsResigning(true);
    resign();
  };

  const isLocked = connectionStatus !== 'connected';

  if (!gameId) return <Navigate to="/" replace />;
  if (error) return <div className={styles.page}><ErrorMessage title="Failed to load game" message={error} onRetry={resetMatch} /></div>;
  if (status === 'lobby') return <LobbyScreen onAccept={sendReady} isConnected={connectionStatus === 'connected'} />;
  if (!chessGame) return <div className={styles.page}><InlineLoader label="Connecting to game..." /></div>;

  // 🚀 AÑADIDO: Las constantes que faltaban para saber los turnos
// 🚀 Ahora entiende ambos idiomas y mantiene el tablero despierto
const isGameActive = chessGame.status === 'in_progress' || chessGame.status === 'active';
  const isPlayer1Turn = chessGame.turn === 'white';
  const isPlayer2Turn = chessGame.turn === 'black';

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <ConnectionStatus status={connectionStatus} />
        <span className={styles.gameId}>#{gameId}</span>
      </div>

      <TerminalCard
        title={`chess — game_${gameId}`}
        status={chessGame.status.toUpperCase()} 
        statusVariant={isGameActive ? 'active' : 'error'} 
        maxWidth="max-w-[560px]"
      >
        <div className="flex flex-col items-center gap-4 w-full">
          
          {/* 🃏 TARJETA DEL RIVAL (NEGRAS - ARRIBA) */}
          {chessGame.player && (
            <PlayerCard 
              name={chessGame.player.player2.name} 
              elo={chessGame.player.player2.elo} 
              avatar={chessGame.player.player2.avatar} 
              isTurn={isPlayer2Turn && isGameActive} 
            />
          )}

          {/* ♟️ EL TABLERO */}
          <ChessBoard
            gameState={chessGame}
            onMove={sendMove}
            onDraw={claimDraw}
            disabled={isLocked || !isGameActive} 
            localPlayerColor={localColor} 
          />

          {/* 🃏 TU TARJETA (BLANCAS - ABAJO) */}
          {chessGame.player && (
            <PlayerCard 
              name={chessGame.player.player1.name} 
              elo={chessGame.player.player1.elo} 
              avatar={chessGame.player.player1.avatar} 
              isTurn={isPlayer1Turn && isGameActive} 
            />
          )}

          <div className={styles.actionRow}>
            <Button 
              variant="primary" 
              onClick={handleResignClick} 
              disabled={isLocked || isResigning || !isGameActive}
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
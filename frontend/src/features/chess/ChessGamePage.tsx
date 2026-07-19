import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ChessBoard } from './ChessBoard';
import { useChessGame } from './hooks/useChessGame';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { InlineLoader, Button } from '@/components';
import { TerminalCard } from '@/components/TerminalCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useMatchStore, useAuthStore } from '@/store';
import { LobbyScreen } from '@/components/LobbyScreen';
import { PlayerCard } from '@/components/PlayerCard';
import { BASE_URL } from '../../services/api';

// 👇 IMPORTAMOS EL MODO ESPECTADOR
import { SpectatorPage } from './../../pages/SpectatorPage';

const styles = {
  page: 'min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6',
  topBar: 'flex items-center justify-between w-full max-w-[520px]',
  gameId: 'text-xs font-mono text-text-muted tracking-widest truncate',
  actionRow: 'flex items-center justify-center gap-3 w-full mt-4',
} as const;

// ==========================================
// 🚦 EL SEMÁFORO (Componente principal)
// ==========================================
export const ChessGamePage = () => {
  const { id } = useParams<{ id: string }>();
  const [role, setRole] = useState<'player1' | 'player2' | 'spectator' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const checkRole = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${BASE_URL}/games/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const json = await response.json();

        if (json.error) {
          setError(json.error); 
          return; 
        }
        
        setRole(json.data.role || 'spectator');
      } catch (err) {
    
        setError("Error de conexión con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [id]);

  if (loading) return <div className={styles.page}><InlineLoader label="Cargando sala..." /></div>;
  if (error) return <div className={styles.page}><ErrorMessage title="Failed to load game" message={error} onRetry={() => window.location.reload()} /></div>;

  // 🛑 Si eres espectador, te muestro TU vista exclusiva
  if (role === 'spectator') {
    return <SpectatorPage />;
  }

  // ✅ Si eres jugador, te monto el tablero oficial con sus castigos
  return <ChessPlayerView />;
};

// ==========================================
// ♟️ LA VISTA DEL JUGADOR
// ==========================================
const ChessPlayerView = () => {
  const { id: gameId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { chessGame, sendMove, resign, connectionStatus, sendReady, claimDraw } = useChessGame(gameId || "");

  const status = useMatchStore((s) => s.status);
  const error = useMatchStore((s) => s.error);
  const resetMatch = useMatchStore((s) => s.resetMatch);
  const currentUser = useAuthStore((s) => s.user);

  const [localColor, setLocalColor] = useState<'w' | 'b'>('w');
  const [isResigning, setIsResigning] = useState(false);

  const gameStatusRef = useRef(chessGame?.status);
  const resignRef = useRef(resign);
  const resetMatchRef = useRef(resetMatch);

  useEffect(() => {
    gameStatusRef.current = chessGame?.status;
    resignRef.current = resign;
    resetMatchRef.current = resetMatch;
  }, [chessGame?.status, resign, resetMatch]);

  // CASTIGO AL ABANDONAR (Solo afecta a los jugadores reales)
  useEffect(() => {
    return () => {
      if (gameStatusRef.current === 'in_progress' || gameStatusRef.current === 'active') {
        resignRef.current();
      }
      resetMatchRef.current();

      const token = localStorage.getItem('auth_token');
      if (token) {
          fetch(`${BASE_URL}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data && data.username) useAuthStore.getState().setUser(data);
        })
        .catch(() => {
        });
      }
    };
  }, []);

  useEffect(() => {
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

  const isGameActive = chessGame.status === 'in_progress' || chessGame.status === 'active';
  const isMeWhite = currentUser?.id === chessGame.player1_id;

  const topPlayer = isMeWhite ? chessGame.player?.player2 : chessGame.player?.player1;
  const bottomPlayer = isMeWhite ? chessGame.player?.player1 : chessGame.player?.player2;
  const isTopTurn = isMeWhite ? (chessGame.turn === 'black') : (chessGame.turn === 'white');
  const isBottomTurn = isMeWhite ? (chessGame.turn === 'white') : (chessGame.turn === 'black');

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

          {topPlayer && (
            <PlayerCard
              name={topPlayer.name}
              elo={topPlayer.elo}
              avatar={topPlayer.avatar}
              isTurn={isTopTurn}
              align="left"
            />
          )}

          <ChessBoard
            gameState={chessGame}
            onMove={sendMove}
            onDraw={claimDraw}
            disabled={isLocked || !isGameActive}
            localPlayerColor={localColor}
          />

          {bottomPlayer && (
            <PlayerCard
              name={bottomPlayer.name}
              elo={bottomPlayer.elo}
              avatar={bottomPlayer.avatar}
              isTurn={isBottomTurn}
              align="left"
            />
          )}

          <div className={styles.actionRow}>
            <Button variant="primary" onClick={handleResignClick} disabled={isLocked || isResigning || !isGameActive}>
              {isResigning ? 'Resigning...' : 'Resign'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNewGame}>Home</Button>
          </div>

        </div>
      </TerminalCard>
    </div>
  );
};
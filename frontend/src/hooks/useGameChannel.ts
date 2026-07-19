import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActionCable } from "./useActionCable";
import { useMatchStore } from "@/store";
import { useSudokuStore } from "@/store/sudokuStore";
import type { ChessGameState } from '@features/chess/types';
import type { SudokuGameState } from "@features/sudoku/types";

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export type GameChannelEvent =
  | { type: 'move_updated'; game: ChessGameState }
  | { type: 'sudoku_updated'; game: SudokuGameState }
  | { type: 'game_over'; status: string; winner?: string; message?: string }
  | { type: 'opponent_disconnect' }
  | { type: 'player_ready'; user_id: number }
  | { type: 'game_start' }
  | { type: 'spectator_count'; count: number };

interface UseGameChanelReturn {
  connectionStatus: ConnectionStatus;
  lastEvent: GameChannelEvent | null;
  sendReady: () => void;
  claimDraw: () => void;
  resign: () => void;
}

export const useGameChannel = (gameId: string | null): UseGameChanelReturn => {
  const { cable } = useActionCable();
  const navigate = useNavigate();
  const subscriptionRef = useRef<any>(null);
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastEvent, setLastEvent] = useState<GameChannelEvent | null>(null);

  // Seleccionamos las funciones de actualización de cada store
  const setChessGame = useMatchStore((s) => s.setChessGame);
  const setSudokuGame = useSudokuStore((s) => s.setSudokuGame);

  useEffect(() => {
    if (!cable || !gameId) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');

    // 1. Identificador exacto de esta sala
    const channelIdentifier = JSON.stringify({ channel: 'GameChannel', game_id: gameId });

    // 2. ♻️ RECICLAJE EXTREMO: Miramos si el cable ya existe en ActionCable
    let activeSub = cable.subscriptions.findAll(channelIdentifier)[0];

    if (!activeSub) {
      //console.log("🏗️ Construyendo nuevo cable inquebrantable para", gameId);
      
      activeSub = cable.subscriptions.create(
        { channel: 'GameChannel', game_id: gameId },
        {
          connected() {
            setConnectionStatus('connected');
          },
          disconnected() {
            setConnectionStatus('disconnected');
          },
          received(raw: unknown) {
            if (!raw || typeof raw !== 'object') return;
            const event = raw as GameChannelEvent;
            setLastEvent(event);

            const isSudoku = gameId.includes('sudoku');

            switch (event.type) {
              case 'move_updated':
                if (!isSudoku) setChessGame(event.game as ChessGameState);
                break;
              case 'sudoku_updated':
                if (isSudoku) setSudokuGame(event.game as SudokuGameState);
                break;
              case 'player_ready':
                //console.log(`👍 El jugador ${event.user_id} está listo.`);
                break;
              case "opponent_disconnect":
                if (!isSudoku) {
                  alert("Tu rival se ha salido de la partida.");
                  useMatchStore.getState().resetMatch();
                  navigate('/');
                }
                break;
              case 'game_start':
                if (!isSudoku) {
                  // 1. Actualizamos el estado global del MatchStore
                  useMatchStore.setState({ status: 'in_progress' });
                  
                  // 2. 🚀 LA CLAVE: Actualizamos también el estado interno de la partida
                  const currentChess = useMatchStore.getState().chessGame;
                  if (currentChess) {
                    setChessGame({ ...currentChess, status: 'active' });
                  }
                }
                break;
              // ✅ NUEVO: Manejo de GAME_OVER (incluye abandono)
              case 'game_over':
                if (!isSudoku) {
                  // 1. Actualizar el estado de la partida
                  const currentChess = useMatchStore.getState().chessGame;
                  if (currentChess) {
                    setChessGame({ 
                      ...currentChess, 
                      status: event.status as any 
                    });
                  }
                  
                  // 2. Marcar como finalizada
                  useMatchStore.setState({ status: 'finished' });
                  
                  // 3. Mostrar mensaje si es por abandono
                  if (event.status === 'resigned' && event.message) {
                    alert(event.message);
                  } else if (event.status === 'draw') {
                    alert('La partida ha terminado en empate.');
                  } else if (event.status === 'checkmate') {
                    alert('¡Jaque mate! Partida finalizada.');
                  }
                }
                break;

              // ✅ NUEVO: Manejo de OPPONENT_DISCONNECT (mejorado)
              case 'opponent_disconnect':
                if (!isSudoku) {
                  // Mostrar mensaje al usuario
                  const opponentName = useMatchStore.getState().opponent?.username || 'Tu rival';
                  alert(`${opponentName} se ha desconectado. La partida ha terminado.`);
                  
                  // Marcar la partida como finalizada
                  const currentChess = useMatchStore.getState().chessGame;
                  if (currentChess) {
                    setChessGame({ 
                      ...currentChess, 
                      status: 'resigned' 
                    });
                  }
                  useMatchStore.setState({ status: 'finished' });
                  
                  // Redirigir al home después de un momento
                  setTimeout(() => navigate('/'), 2000);
                }
                break;

              default:
                console.log('[GameChannel] Evento no procesado:', event);
            }
          },
        }
      );
    } else {
      setConnectionStatus('connected');
    }

    subscriptionRef.current = activeSub;
    
  }, [gameId, cable]);
  const sendReady = () => subscriptionRef.current?.perform('player_ready');
  const claimDraw = () => subscriptionRef.current?.perform('claim_draw');
  const resign = () => subscriptionRef.current?.perform('resign');

  return { connectionStatus, lastEvent, sendReady, claimDraw, resign };
};

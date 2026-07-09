import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActionCable } from "./useActionCable";
import { useMatchStore } from "@/store";
import { useSudokuStore } from "@/store/sudokuStore";
import type { ChessGameState } from '@features/chess/types';
import type { SudokuGameState } from "@features/sudoku/types";

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

type GameChannelEvent =
  | { type: 'move_updated'; game: ChessGameState }
  | { type: 'sudoku_updated'; game: SudokuGameState }
  | { type: 'game_over'; status: string }
  | { type: 'opponent_disconnect' }
  | { type: 'player_ready'; user_id: number }
  | { type: 'game_start' };

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
      console.log("🏗️ Construyendo nuevo cable inquebrantable para", gameId);
      
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
                console.log(`👍 El jugador ${event.user_id} está listo.`);
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
              case 'game_over':
                if (!isSudoku) {
                  useMatchStore.setState({ status: 'finished' });
                  const currentChess = useMatchStore.getState().chessGame;
                  if (currentChess) {
                    setChessGame({ ...currentChess, status: event.status as any });
                  }
                }
                break;
              default:
                console.warn('[GameChannel] Evento no procesado:', event);
            }
          },
        }
      );
    } else {
      console.log("♻️ Reutilizando cable existente para", gameId);
      setConnectionStatus('connected');
    }

    // Guardamos la referencia (ya sea nueva o reciclada)
    subscriptionRef.current = activeSub;

    // 🛑 MODO INMORTAL: NO HAY RETURN. NO HAY UNSUBSCRIBE.
    // Dejamos que el cable viva tranquilamente en la memoria del navegador.
    
  }, [gameId, cable]);

  const sendReady = () => subscriptionRef.current?.perform('player_ready');
  const claimDraw = () => subscriptionRef.current?.perform('claim_draw');
  const resign = () => subscriptionRef.current?.perform('resign');

  return { connectionStatus, lastEvent, sendReady, claimDraw, resign };
};


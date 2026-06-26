import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActionCable } from "./useActionCable";
import type { ChessGameState } from '@features/chess/types';
import type { SudokuGameState } from "@features/sudoku/types";
import { useMatchStore } from "@/store";

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
}

// Mapa global definido UNA sola vez arriba del todo
const pendingUnsubscribes = new Map<string, ReturnType<typeof setTimeout>>();

export const useGameChannel = (gameId: string | null): UseGameChanelReturn => {
  const { cable } = useActionCable();
  const navigate = useNavigate();
  const subscriptionRef = useRef<ReturnType<typeof cable.subscriptions.create> | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastEvent, setLastEvent] = useState<GameChannelEvent | null>(null);

  const setChessGame = useMatchStore((s) => s.setChessGame);
  const setSudokuGame = useMatchStore((s) => s.setSudokuGame);

  useEffect(() => {
    if (!gameId || !cable) return;

    if (pendingUnsubscribes.has(gameId)) {
      clearTimeout(pendingUnsubscribes.get(gameId)!);
      pendingUnsubscribes.delete(gameId);
    }

    setConnectionStatus('connecting');

    if (!subscriptionRef.current) {
      subscriptionRef.current = cable.subscriptions.create(
        { channel: 'GameChannel', game_id: gameId },
        {
          connected() {
            setConnectionStatus('connected');
          },
          disconnected() {
            setConnectionStatus('disconnected');
            setTimeout(() => {
              setConnectionStatus('reconnecting');
            }, 3000);
          },
          rejected() {
            setConnectionStatus('disconnected');
            console.error(`[GameChannel] Subscription rejected for game ${gameId}`);
          },
          received(raw: unknown) {
            if (!raw || typeof raw !== 'object') return;
            const event = raw as GameChannelEvent;

            setLastEvent(event);

            switch (event.type) {
              case 'move_updated':
                setChessGame(event.game);
                break;
              case 'sudoku_updated':
                setSudokuGame(event.game);
                break;
              case 'game_over':
                break;
              case "opponent_disconnect":
                console.warn('[GameChannel] Opponent disconnected');
                alert("Tu rival se ha salido de la partida, se cancela.");
                useMatchStore.getState().resetMatch();
                navigate('/');
                break;
              case 'player_ready':
                console.log(`[GameChannel] ¡El jugador ${event.user_id} está listo!`);
                break;
              case 'game_start':
                console.log(`🚀 [GameChannel] ¡LOS DOS ESTÁN LISTOS! Arrancando...`);
                useMatchStore.setState({ status: 'in_progress' });
                break;
              default:
                console.warn('[GameChannel] Unknown event:', event);
            }
          },
        }
      );
    }

    return () => {
      const timeout = setTimeout(() => {
        subscriptionRef.current?.unsubscribe();
        subscriptionRef.current = null;
        setConnectionStatus('disconnected');
        pendingUnsubscribes.delete(gameId);
      }, 1000);
      
      pendingUnsubscribes.set(gameId, timeout);
    };
  }, [gameId, cable, navigate, setChessGame, setSudokuGame]);

  const sendReady = () => {
    console.log("🚀 Intentando enviar READY a:", subscriptionRef.current);
    if (subscriptionRef.current) {
      subscriptionRef.current.perform('player_ready');
    } else {
      console.error("❌ No hay suscripción activa para enviar READY");
    }
  };

  return { connectionStatus, lastEvent, sendReady };
};
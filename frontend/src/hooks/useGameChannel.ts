import { useEffect, useRef, useState } from "react";
import { useActionCable } from "./useActionCable";
import type { ChessGameState } from '@features/chess/types';
import type { SudokuGameState } from "@features/sudoku/types";
import { useMatchStore } from "@/store";

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

type GameChannelEvent =
  | { type: 'move_updated'; game: ChessGameState }
  | { type: 'sudoku_updated'; game: SudokuGameState }
  | { type: 'game_over'; status: string }
  | { type: 'opponent_disconnect' };

interface UseGameChanelReturn {
  connectionStatus: ConnectionStatus;
  lastEvent: GameChannelEvent | null;
}

export const useGameChannel = (gameId: string | null): UseGameChanelReturn => {
  const { cable } = useActionCable();
  const subscriptionRef = useRef<ReturnType<typeof cable.subscriptions.create> | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastEvent, setLastEvent] = useState<GameChannelEvent | null>(null);

  const setChessGame = useMatchStore((s) => s.setChessGame);
  const setSudokuGame = useMatchStore((s) => s.setSudokuGame);

  useEffect(() => {
    if (!gameId) return;

    setConnectionStatus('connecting');

    subscriptionRef.current = cable.subscriptions.create(
      { channel: 'GameChannel', game_id: gameId },
      {
        connected() {
          setConnectionStatus('connected');
        },
        disconnected() {
          setConnectionStatus('disconnected');
          // attempt reconnect after 3 seconds
          setTimeout(() => {
            setConnectionStatus('reconnecting');
          }, 3000);
        },
        rejected() {
          setConnectionStatus('disconnected');
          console.error(`[GameChanel] Subscription rejected for game ${gameId}`);
        },
        recieved(raw: unknown) {
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
              break;
            default:
              console.warn('[GameChannel] Unknown event:', event);
          }
        },
      }
    );
    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      setConnectionStatus('disconnected');
    };
  }, [gameId]);
  return { connectionStatus, lastEvent };
}
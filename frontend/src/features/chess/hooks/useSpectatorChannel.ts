import { useEffect, useRef, useState } from 'react';
import { useActionCable } from '@/hooks';
import { useMatchStore } from '@/store';
import type { ChessGameState } from '@/features/chess/types';
import type { ConnectionStatusType } from '@/types';

interface SpectatorEvent {
  type:       'game_snapshot' | 'move_updated' | 'game_over' | 'player_connected' | 'player_disconnected';
  game?:      ChessGameState;
  status?:    string;
  player?:    string;
  spectators?: number;
}

interface UseSpectatorChannelReturn {
  connectionStatus: ConnectionStatusType;
  spectatorCount:   number;
  lastEvent:        SpectatorEvent | null;
}

export const useSpectatorChannel = (
  gameId: string | null
): UseSpectatorChannelReturn => {
  const { cable }        = useActionCable();
  const subscriptionRef  = useRef<ReturnType<typeof cable.subscriptions.create> | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusType>('connecting');
  const [spectatorCount,   setSpectatorCount]   = useState(0);
  const [lastEvent,        setLastEvent]         = useState<SpectatorEvent | null>(null);

  const setChessGame = useMatchStore((s) => s.setChessGame);

  useEffect(() => {
    if (!gameId) return;

    setConnectionStatus('connecting');

    subscriptionRef.current = cable.subscriptions.create(
      // SpectatorChannel — read-only, no move permissions
      { channel: 'SpectatorChannel', game_id: gameId },
      {
        connected() {
          setConnectionStatus('connected');
        },

        disconnected() {
          setConnectionStatus('disconnected');
          setTimeout(() => setConnectionStatus('reconnecting'), 3000);
        },

        rejected() {
          setConnectionStatus('disconnected');
          console.warn(`[SpectatorChannel] Subscription rejected for game ${gameId}`);
        },

        received(raw: unknown) {
          if (!raw || typeof raw !== 'object') return;
          const event = raw as SpectatorEvent;
          setLastEvent(event);

          switch (event.type) {
            case 'game_snapshot':
              if (event.game) setChessGame(event.game);
              if (event.spectators !== undefined) setSpectatorCount(event.spectators);
              break;

            case 'move_updated':
              if (event.game) setChessGame(event.game);
              break;

            case 'game_over':
              if (event.game) setChessGame(event.game);
              break;

            case 'player_connected':
            case 'player_disconnected':
              break;

            default:
              console.warn('[SpectatorChannel] Unknown event:', event);
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

  return { connectionStatus, spectatorCount, lastEvent };
};

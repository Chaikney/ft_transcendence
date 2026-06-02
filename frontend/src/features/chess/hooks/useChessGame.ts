import { useEffect } from "react";
import { useMatchStore } from "@/store";
import { getChessGame, postChessMove, postChesAIMove } from "@services/chess.service";
import { useGameChannel } from "@/hooks";
import type { ChessMovePayload } from '../types';
import { ConnectionStatus } from "@/components/ConnectionStatus";

// TODO: Dev flag - flip to false when the backend is ready
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const useChessGame = (gameId: string) => {
  const chessGame = useMatchStore((s) => s.chessGame);
  const setChessGame = useMatchStore((s) => s.setChessGame);
  const startLoading = useMatchStore((s) => s.startLoading);
  const setError = useMatchStore((s) => s.setError);
  const { connectionStatus } = useGameChannel(USE_MOCK ? null : gameId);

  // load initial game state
  useEffect(() => {
    const load = async () => {
      startLoading('chess');
      try {
        if (USE_MOCK)
          // <- MOCK
          const { mockChessGame } = await import('@/mocks');
          setChessGame(mockChessGame);
        else {
          // REAL
          const res = await getChessGame(gameId);
          setChessGame(res.data);
        }
      } catch (err) {
        setError('Failed to load game. Please try again');
      }
    };
    load();
  }, [gameId]);

  // send a move
  const sendMove = async (payload: Omit<ChessMovePayload, 'game_id'>) => {
    if (!chessGame) return;
    try {
      if (USE_MOCK) {
        // <- MOCK: simulate opponent response
        const { mockChessGameAfterMove } = await import('@/mocks');
        setChessGame(mockChessGameAfterMove);
      } else {
        // <- REAL: backend will broadcast update via actioCable
        await postChessMove({ ...payload, game_id: gameId });
        // no need to setchessgame here = websocket handle its
      }
    } catch (err) {
      setError('Move failed. Please try again.');
    }
  };

  // Request AI move
  const requestAiMove = async () => {
    if (!chessGame) return;
    try {
      if (USE_MOCK) {
        const { mockChessGameAfterMove } = await import('@/mocks');
        setChessGame(mockChessGameAfterMove);
      } else {
        await postChesAIMove(gameId);
        // Again - websocket broadcast the result
      }
    } catch (err) {
      setError('AI move failed.');
    }
  };
  return { chessGame, sendMove, requestAiMove, ConnectionStatus };
};

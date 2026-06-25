import { useEffect } from "react";
import { useMatchStore } from "@/store";
import { getChessGame, postChessMove, postChessAIMove } from "../service";
import { useGameChannel } from "@/hooks";
import type { ChessGameState, ChessMovePayload } from '../types';

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
        if (USE_MOCK) {
          // <- MOCK
          const { mockChessGame } = await import('@/mocks');
          setChessGame(mockChessGame);
        }
        else {
          // REAL
          const res = await getChessGame(gameId);
          
          // Magia a prueba de balas: cogemos res.data si existe, y si no (nuestro caso), cogemos res a secas.
          // El 'as unknown as ChessGameState' hace que TypeScript se calle y quite la línea roja.
          const actualData = (res as any).data || res;
          setChessGame(actualData as unknown as ChessGameState);
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
        const { mockChessGameAfterMove } = await import('@/mocks');
        setChessGame(mockChessGameAfterMove);
      } else {
        const res = await postChessMove({ ...payload, game_id: gameId });
        const actualData = (res as any).data || res;

        // 🥷 EL FIX: Si el backend nos manda la bandera secreta, 
        // abortamos el movimiento y hacemos snapback silenciosamente.
        if (actualData.illegal_move) {
          setChessGame({ ...chessGame });
          return;
        }

        // Si no hay bandera, el movimiento es legal y actualizamos el tablero.
        setChessGame(actualData as unknown as ChessGameState);
      }
    } catch (err) {
      // Ya solo caeremos aquí si el servidor explota de verdad (Error 500)
      setChessGame({ ...chessGame }); 
    }
  };

  // Request AI move
  const requestAIMove = async () => {
    if (!chessGame) return;
    try {
      if (USE_MOCK) {
        const { mockChessGameAfterMove } = await import('@/mocks');
        setChessGame(mockChessGameAfterMove);
      } else {
        await postChessAIMove(gameId);
        // Again - websocket broadcast the result
      }
    } catch (err) {
      setError('AI move failed.');
    }
  };
  return { chessGame, sendMove, requestAIMove, connectionStatus };
};

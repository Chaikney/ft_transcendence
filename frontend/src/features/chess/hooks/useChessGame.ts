import { useEffect } from "react";
import { useMatchStore } from "@/store";
import { getChessGame, postChessMove, postChessAIMove } from "../service";
import { useGameChannel } from "@/hooks";
import type { ChessGameState, ChessMovePayload } from '../types';

// TODO: Dev flag - flip to false when the backend is ready
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'false';

export const useChessGame = (gameId: string) => {
  const chessGame = useMatchStore((s) => s.chessGame);
  const setChessGame = useMatchStore((s) => s.setChessGame);
  const startLoading = useMatchStore((s) => s.startLoading);
  const setError = useMatchStore((s) => s.setError);
  const { connectionStatus, sendReady } = useGameChannel(USE_MOCK ? null : gameId);

  // load initial game state
  useEffect(() => {
    // En useChessGame.ts -> load()
  const load = async () => {
    if (useMatchStore.getState().status !== 'lobby') {
      startLoading('chess');
    }

    try {
      const res = await getChessGame(gameId);
      // IMPORTANTE: Si tu backend devuelve el objeto directo, res es el objeto.
      const actualData = (res as any).data || res;
      
      console.log("DEBUG: Datos recibidos del servidor:", actualData);
      setChessGame(actualData as ChessGameState);
    } catch (err) {
      setError('Failed to load game');
    }
  };
    load();
  }, [gameId]); // Nota: no ponemos startLoading en dependencias para evitar bucles

  // send a move
  const sendMove = async (payload: Omit<ChessMovePayload, 'game_id'>) => {
    if (!chessGame) return;
    try {
      if (USE_MOCK) {
        const { mockChessGameAfterMove } = await import('@/mocks');
        setChessGame(mockChessGameAfterMove);
      } else {
        // 1. Validamos con el servidor
        const res = await postChessMove({ ...payload, game_id: gameId });
        const actualData = (res as any).data || res;

        // 2. Si es ilegal, volvemos atrás el estado local para que la pieza no se quede "flotando"
        if (actualData.illegal_move) {
          setChessGame({ ...chessGame });
          return;
        }

        // 3. 🚀 AQUÍ ESTÁ LA MAGIA: 
        // No llamamos a setChessGame aquí. 
        // Dejamos que el servidor procese el broadcast y el useGameChannel lo reciba.
      }
    } catch (err) {
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
  return { chessGame, sendMove, requestAIMove, connectionStatus, sendReady };
};
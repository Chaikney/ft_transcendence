import { useEffect } from "react";
import { useMatchStore } from "@/store";
import { getSudokuGame, postSudokuMove } from "@/services/sudoku.service";
import { useGameChannel } from "@/hooks";
import type { SudokuMovePayload } from "../types";
import { ConnectionStatus } from "@/components/ConnectionStatus";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const useSudokuGame = (gameId: string) => {
  const sudokuGame = useMatchStore((s) => s.sudokuGame);
  const setSudokuGame = useMatchStore((s) => s.setSudokuGame);
  const startLoading = useMatchStore((s) => s.startLoading);
  const setError = useMatchStore((s) => s.setError);
  const { connectionStatus } = useGameChannel(USE_MOCK ? null : gameId);

  useEffect(() => {
    const load = async () => {
      startLoading('sudoku');
      try {
        if (USE_MOCK) {
          const { mockSudokuGame } = await import('@/mocks');
          setSudokuGame(mockSudokuGame);
        } else {
          const res = await getSudokuGame(gameId);
          setSudokuGame(res.data);
        }
      } catch (err) {
        setError('Failed to load sudoku game');
      }
    };
    load();
  }, [gameId]);

  const sendMove = async (payload: SudokuMovePayload) => {
    try {
      if (USE_MOCK) {
        console.log('[MOCK] Sudoku move:', payload);
      } else {
        await postSudokuMove(payload);
        // websocket broadcasts updated grid
      }
    } catch (err) {
      setError('Move failed.');
    }
  };
  return { sudokuGame, sendMove, ConnectionStatus };
};
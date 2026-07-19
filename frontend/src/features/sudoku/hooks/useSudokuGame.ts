import { useEffect } from "react";
import { useMatchStore } from "@/store";
import { getSudokuGame, postSudokuMove } from "@/features/sudoku/service";
import { useGameChannel } from "@/hooks";
import type { SudokuMovePayload, SudokuDifficulty, SudokeStatus } from "../types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

interface SudokuApiResponse {
  id: number;
  status: string;
  board: string;
  difficulty: SudokuDifficulty;
}

const normalizeStatus = (status: string): SudokeStatus => {
  if (status === 'in_progress') return 'active';
  return status as SudokeStatus;
};

export const useSudokuGame = (gameId: string) => {
  const sudokuGame   = useMatchStore((s) => s.sudokuGame);
  const setSudokuGame = useMatchStore((s) => s.setSudokuGame);
  const updateCell   = useMatchStore((s) => s.updateCell);
  const startLoading = useMatchStore((s) => s.startLoading);
  const setError     = useMatchStore((s) => s.setError);

  const { connectionStatus } = useGameChannel(USE_MOCK ? null : gameId);

  useEffect(() => {
    const load = async () => {
      startLoading('sudoku');
      try {
        if (USE_MOCK) {
          const { mockSudokuGame } = await import('@/mocks');
          setSudokuGame(mockSudokuGame);
        } else {
          const numericId = gameId.replace(/\D/g, '');
          const res = await getSudokuGame(numericId);
          const gameData = res as unknown as SudokuApiResponse;

          if (!gameData?.board || typeof gameData.board !== 'string') {
            throw new Error("El formato del tablero recibido es inválido o está vacío");
          }

          const gridMatrix: number[][] = Array.from({ length: 9 }, (_, i) =>
            gameData.board.slice(i * 9, i * 9 + 9).split('').map(Number)
          );

          setSudokuGame({
            game_id: String(gameData.id),
            grid: gridMatrix,
            difficulty: gameData.difficulty,
            status: normalizeStatus(gameData.status),
          });
        }
      } catch (err) {
        //console.error("Error cargando el juego:", err);
        setError('Failed to load sudoku game');
      }
    };

    if (gameId) load();
  }, [gameId, setSudokuGame, startLoading, setError]);

  const sendMove = async (payload: SudokuMovePayload) => {
    if (!sudokuGame) return;

    // 1. Optimistic update
    updateCell(payload.row, payload.col, payload.value);

    if (USE_MOCK) return;

    // 2. Build board string
    const newGrid = sudokuGame.grid.map((r, rIdx) =>
      r.map((cell, cIdx) =>
        rIdx === payload.row && cIdx === payload.col ? payload.value : cell
      )
    );
    const boardString = newGrid.flat().join('');

    // 3. Patch backend and read response
    try {
      const res = await postSudokuMove({ ...payload, board: boardString });
      const updated = res as unknown as SudokuApiResponse;

      // 4. If backend changed status (e.g. 'won'), sync it to the store
      if (updated?.status) {
        const newStatus = normalizeStatus(updated.status);
        if (newStatus !== sudokuGame.status) {
          setSudokuGame({
            ...sudokuGame,
            grid: newGrid,
            status: newStatus,
          });
        }
      }
    } catch (err) {
      //console.error('Move failed to sync:', err);
    }
  };

  return { sudokuGame, sendMove, connectionStatus };
};

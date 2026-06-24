import { useEffect } from "react";
import { useMatchStore } from "@/store";
import { getSudokuGame, postSudokuMove } from "@/features/sudoku/service";
import { useGameChannel } from "@/hooks";
import type { SudokuMovePayload, SudokuDifficulty, SudokeStatus } from "../types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Definimos la interfaz basada en lo que recibimos realmente del servidor
interface SudokuApiResponse {
  id: number;
  status: string; // Recibimos string para poder normalizarlo
  board: string;
  difficulty: SudokuDifficulty;
}

export const useSudokuGame = (gameId: string) => {
  const sudokuGame = useMatchStore((s) => s.sudokuGame);
  const setSudokuGame = useMatchStore((s) => s.setSudokuGame);
  const updateCell = useMatchStore((s) => s.updateCell);
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
          const numericId = gameId.replace(/\D/g, '');
          const res = await getSudokuGame(numericId);
          
          // Asumimos que res es el objeto de datos que vimos en la consola
          const gameData = res as unknown as SudokuApiResponse;

          if (!gameData?.board || typeof gameData.board !== 'string') {
            throw new Error("El formato del tablero recibido es inválido o está vacío");
          }

          // Convertimos el string de 81 caracteres a matriz 9x9
          const gridMatrix: number[][] = Array.from({ length: 9 }, (_, i) =>
            gameData.board
              .slice(i * 9, i * 9 + 9)
              .split('')
              .map(Number)
          );

          // Normalización: in_progress -> active
          const normalizedStatus: SudokeStatus = (gameData.status === 'in_progress') 
            ? 'active' 
            : (gameData.status as SudokeStatus);

          setSudokuGame({
            game_id: String(gameData.id),
            grid: gridMatrix,
            difficulty: gameData.difficulty,
            status: normalizedStatus,
          });
        }
      } catch (err) {
        console.error("Error cargando el juego:", err);
        setError('Failed to load sudoku game');
      }
    };

    if (gameId) load();
  }, [gameId, setSudokuGame, startLoading, setError]);

  const sendMove = async (payload: SudokuMovePayload) => {
    if (!sudokuGame) return;

    // 1. Actualización optimista: el usuario ve el cambio instantáneamente
    updateCell(payload.row, payload.col, payload.value);

    if (USE_MOCK) return;

    // 2. Construir el nuevo string de tablero de 81 caracteres
    const newGrid = sudokuGame.grid.map((r, rIdx) =>
      r.map((cell, cIdx) =>
        rIdx === payload.row && cIdx === payload.col ? payload.value : cell
      )
    );
    const boardString = newGrid.flat().join('');

    // 3. Patch al backend
    try {
      await postSudokuMove({
        ...payload,
        board: boardString,
      });
    } catch (err) {
      console.error('Move failed to sync:', err);
    }
  };

  return { sudokuGame, sendMove, connectionStatus };
};
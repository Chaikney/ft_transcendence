import { useEffect } from "react";
import { useMatchStore } from "@/store";
import { getSudokuGame, postSudokuMove } from "@/features/sudoku/service";
import { useGameChannel } from "@/hooks";
import type { SudokuMovePayload } from "../types";

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
          // Extraemos solo los dígitos (ej: "sudoku-001" -> "001")
          // Esto limpia el ID antes de enviarlo al backend
          const numericId = gameId.replace(/\D/g, ''); 
          
          const res = await getSudokuGame(numericId);
          
          // Imprimimos 'res' entero para confirmar que aquí está tu tabler
          
          // 🟢 LA SOLUCIÓN: Si res ya trae el game_id, se lo pasamos directo sin el .data
          if (res.game_id || res.grid) {
            setSudokuGame(res);
          } else {
            setSudokuGame(res.data);
          }
        }
      } catch (err) {
        console.error("Error cargando el juego:", err);
        setError('Failed to load sudoku game');
      }
    };
    
    if (gameId) load();
  }, [gameId, setSudokuGame, startLoading, setError]);

  const sendMove = async (payload: SudokuMovePayload) => {
    try {
      if (USE_MOCK) {
        console.log('[MOCK] Sudoku move:', payload);
      } else {
        await postSudokuMove(payload);
      }
    } catch (err) {
      setError('Move failed.');
    }
  };
  
  return { sudokuGame, sendMove, connectionStatus };
};
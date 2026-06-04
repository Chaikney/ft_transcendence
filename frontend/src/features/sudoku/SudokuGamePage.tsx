import { useRef } from "react";
import { SudokuBoard } from "./SudokuBoard";
import { useSudokuBoard } from "./hooks/useSudokuBoard";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { useSudokuGame } from "./hooks/useSudokuGame";

export const SudokuGamePage = ({ gameId }: { gameId: string }) => {
  const { sudokuGame, sendMove, connectionStatus } = useSudokuGame(gameId);

  // Snapshot original grid on first load - never changes
  const originalGridRef = useRef<number[][] | null>(null);
  if (sudokuGame && !originalGridRef.current) {
    originalGridRef.current = sudokuGame.grid.map((row) => [...row]);
  }
  if (!sudokuGame || !originalGridRef.current) {
    return <div className="text-gray-400 font-mono">Loading game...</div>
  }
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <ConnectionStatus status={connectionStatus} />
      <SudokuBoard
        gameState={sudokuGame}
        originalGrid={originalGridRef.current}
        onMove={sendMove}
        disabled={connectionStatus !== 'connected' && import.meta.env.VITE_USE_MOCK !== 'true'}
      />
    </div>
  );
};
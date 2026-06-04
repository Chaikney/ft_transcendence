import { ChessBoard } from "./ChessBoard";
import { useChessGame } from "./hooks/useChessGame";
import { ConnectionStatus } from "@/components/ConnectionStatus";

export const ChessGamePage = ({ gameId }: { gameId: string }) => {
  const { chessGame, sendMove, requestAIMove, connectionStatus } = useChessGame(gameId);

  if (!chessGame) return <div className="text-gray-400 font-mono">Loading game...</div>

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <ConnectionStatus status={connectionStatus}/>
      <ChessBoard
        gameState={chessGame}
        onMove={sendMove}
        disabled={connectionStatus !== 'connected' && import.meta.env.VITE_USE_MOCK !== 'true'}
      />
      <button
        onClick={requestAIMove}
        className="px-4 py-2 bg-gray-800 text-white font-mono text-sm rounded hover:bg-gray-700 transition-colors"
        >
        Request AI Move
      </button>
    </div>
  );
};
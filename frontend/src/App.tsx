import { useEffect} from 'react'
import { SudokuBoard } from './features/sudoku';
import { useMatchStore } from './store';
import { mockSudokuGame } from './mocks';
import './App.css';

export default function App() {
  const sudokuGame = useMatchStore((s) => s.sudokuGame);
  const setSudokuGame = useMatchStore((s) => s.setSudokuGame);

  useEffect(() => {
    setSudokuGame(mockSudokuGame);
  }, [setSudokuGame]);

  if (!sudokuGame) {
    return <div>Loading...</div>;
  }

  return (
    <SudokuBoard
      gameState={sudokuGame}
      originalGrid={mockSudokuGame.grid}
      onMove={(payload) => console.log('Move:', payload)}
    />
  );
}
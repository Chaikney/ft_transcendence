export { mockChessGame, mockChessGameAfterMove, mockChessGameCheckmate } from './chess.mock';
export { mockSudokuGame, mockSudokuGameWon } from './sudoku.mock';
export { mockUser} from './auth.mock';

// How to use mocks in your store during development:
// In any component or hook — swap this for real API call later
/* import { mockChessGame } from '../mocks';
import { useMatchStore } from '../store';

const setChessGame = useMatchStore((state) => state.setChessGame);

// Simulate loading a game
setChessGame(mockChessGame); */
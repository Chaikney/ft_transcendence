import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ChessGamePage } from './features/chess/ChessGamePage';
import { SudokuGamePage } from './features/sudoku/SudokuGamePage';
import { useMatchStore } from './store';

const styles = {
  shell:
    'min-h-screen bg-bg-base flex flex-col',
  content:
    'flex-1 pt-14',
  gridBg:
    'absolute inset-0 ' +
    '[background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] ' +
    '[background-size:48px_48px] opacity-[0.35] pointer-events-none',
  vignette:
    'absolute inset-0 ' +
    'bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_40%,var(--bg-base)_100%)] ' +
    'pointer-events-none',
  pageWrapper:
    'relative flex-1 flex flex-col',
} as const;

const GAME_IDS = {
  chess:  'chess-001',
  sudoku: 'sudoku-001',
} as const;

export default function App() {
  const [activeGame, setActiveGame] = useState<'chess' | 'sudoku'>('chess');
  const resetMatch = useMatchStore((s) => s.resetMatch);

  const handleSelectGame = (game: 'chess' | 'sudoku') => {
    resetMatch();
    setActiveGame(game);
  };

  return (
    <div className={styles.shell}>
      <Navbar
        activeGame={activeGame}
        onSelectGame={handleSelectGame}
      />

      <main className={styles.content}>
        <div className={styles.pageWrapper}>
          <div className={styles.gridBg} aria-hidden />
          <div className={styles.vignette} aria-hidden />

          {activeGame === 'chess' ? (
            <ChessGamePage gameId={GAME_IDS.chess} />
          ) : (
            <SudokuGamePage gameId={GAME_IDS.sudoku} />
          )}
        </div>
      </main>
    </div>
  );
}
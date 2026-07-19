import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSudokuGame } from './service';
import { InlineLoader } from '@/components';

export const SudokuLobby = () => {
  const navigate = useNavigate();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const create = async () => {
      try {
        const res = await createSudokuGame('easy');
        const newGame = res as unknown as { id: number };
        navigate(
          `/game/sudoku/sudoku-${String(newGame.id).padStart(3, '0')}`,
          { replace: true }
        );
      } catch (err) {
        //console.error('Failed to create sudoku game:', err);
        navigate('/', { replace: true });
      }
    };

    create();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <InlineLoader label="Creating puzzle..." />
    </div>
  );
};
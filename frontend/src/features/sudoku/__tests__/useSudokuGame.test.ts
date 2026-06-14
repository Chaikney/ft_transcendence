import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSudokuGame } from '../hooks/useSudokuGame';
import { useMatchStore } from '@/store';
import { mockSudokuGame } from '@/mocks';
import { server, errorHandlers } from '@/test/mswServer';

vi.stubEnv('VITE_USE_MOCK', 'false');

beforeEach(() => {
  useMatchStore.getState().resetMatch();
});

describe('useSudokuGame — load', () => {
  it('loads game and transitions store to in_progress', async () => {
    renderHook(() => useSudokuGame('sudoku-001'));

    await waitFor(() => {
      expect(useMatchStore.getState().status).toBe('in_progress');
    });

    expect(useMatchStore.getState().sudokuGame).toEqual(mockSudokuGame);
  });

  it('returns sudokuGame from store after load', async () => {
    const { result } = renderHook(() => useSudokuGame('sudoku-001'));

    await waitFor(() => {
      expect(result.current.sudokuGame).not.toBeNull();
    });

    expect(result.current.sudokuGame?.game_id).toBe(mockSudokuGame.game_id);
    expect(result.current.sudokuGame?.grid).toHaveLength(9);
  });

  it('sets error on load failure', async () => {
    server.use(errorHandlers.sudokuLoadFail);

    renderHook(() => useSudokuGame('sudoku-bad'));

    await waitFor(() => {
      expect(useMatchStore.getState().status).toBe('error');
    });

    expect(useMatchStore.getState().error).toBe('Failed to load sudoku game');
  });
});

describe('useSudokuGame — sendMove', () => {
  it('sendMove completes without error on success', async () => {
    const { result } = renderHook(() => useSudokuGame('sudoku-001'));
    await waitFor(() => expect(result.current.sudokuGame).not.toBeNull());

    await result.current.sendMove({
      game_id: 'sudoku-001',
      row: 0,
      col: 2,
      value: 4,
    });

    expect(useMatchStore.getState().error).toBeNull();
  });
});
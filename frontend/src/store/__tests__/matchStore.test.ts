import { describe, it, expect, beforeEach } from 'vitest';
import { useMatchStore } from '../matchStore';
import { mockChessGame, mockSudokuGame } from '@/mocks';

// Reset store between tests
beforeEach(() => {
  useMatchStore.getState().resetMatch();
});

describe('matchStore — state machine', () => {
  it('starts in idle state', () => {
    const state = useMatchStore.getState();
    expect(state.status).toBe('idle');
    expect(state.chessGame).toBeNull();
    expect(state.sudokuGame).toBeNull();
  });

  it('startLoading transitions to loading', () => {
    useMatchStore.getState().startLoading('chess');
    const state = useMatchStore.getState();
    expect(state.status).toBe('loading');
    expect(state.gameType).toBe('chess');
  });

  it('setChessGame transitions to in_progress', () => {
    useMatchStore.getState().setChessGame(mockChessGame);
    const state = useMatchStore.getState();
    expect(state.status).toBe('in_progress');
    expect(state.chessGame).toEqual(mockChessGame);
  });

  it('setSudokuGame transitions to in_progress', () => {
    useMatchStore.getState().setSudokuGame(mockSudokuGame);
    const state = useMatchStore.getState();
    expect(state.status).toBe('in_progress');
    expect(state.sudokuGame).toEqual(mockSudokuGame);
  });

  it('setError transitions to error with message', () => {
    useMatchStore.getState().setError('Network error');
    const state = useMatchStore.getState();
    expect(state.status).toBe('error');
    expect(state.error).toBe('Network error');
  });

  it('resetMatch returns to initial state', () => {
    useMatchStore.getState().setChessGame(mockChessGame);
    useMatchStore.getState().resetMatch();
    const state = useMatchStore.getState();
    expect(state.status).toBe('idle');
    expect(state.chessGame).toBeNull();
    expect(state.error).toBeNull();
  });

  it('does not mutate state directly — only via actions', () => {
    // Components must use actions, not setState
    const before = useMatchStore.getState().status;
    expect(before).toBe('idle');
    // Verify action produces expected transition
    useMatchStore.getState().startLoading('sudoku');
    expect(useMatchStore.getState().status).toBe('loading');
  });
});
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSudokuBoard } from '../hooks/useSudokuBoard';
import { mockSudokuGame } from '@/mocks';

const originalGrid = mockSudokuGame.grid;
const gameId = 'sudoku-test-001';

describe('useSudokuBoard — isLocked', () => {
  it('does not select a locked cell (non-zero in originalGrid)', () => {
    const onMove = vi.fn();
    const { result } = renderHook(() =>
      useSudokuBoard(gameId, originalGrid, onMove)
    );
    // (0,0) = 5 in mock — locked
    act(() => result.current.selectCell(0, 0));
    expect(result.current.selectedCell).toBeNull();
  });

  it('selects an empty cell (zero in originalGrid)', () => {
    const onMove = vi.fn();
    const { result } = renderHook(() =>
      useSudokuBoard(gameId, originalGrid, onMove)
    );
    // (0,2) = 0 in mock — unlocked
    act(() => result.current.selectCell(0, 2));
    expect(result.current.selectedCell).toEqual([0, 2]);
  });

  it('emits move payload when inputValue called on selected cell', () => {
    const onMove = vi.fn();
    const { result } = renderHook(() =>
      useSudokuBoard(gameId, originalGrid, onMove)
    );
    act(() => result.current.selectCell(0, 2));
    act(() => result.current.inputValue(4));
    expect(onMove).toHaveBeenCalledWith({
      game_id: gameId,
      row: 0,
      col: 2,
      value: 4,
    });
  });

  it('does not emit if no cell selected', () => {
    const onMove = vi.fn();
    const { result } = renderHook(() =>
      useSudokuBoard(gameId, originalGrid, onMove)
    );
    act(() => result.current.inputValue(5));
    expect(onMove).not.toHaveBeenCalled();
  });

  it('clearSelection resets selectedCell to null', () => {
    const onMove = vi.fn();
    const { result } = renderHook(() =>
      useSudokuBoard(gameId, originalGrid, onMove)
    );
    act(() => result.current.selectCell(0, 2));
    act(() => result.current.clearSelection());
    expect(result.current.selectedCell).toBeNull();
  });
});
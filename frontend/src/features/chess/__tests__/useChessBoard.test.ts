import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChessBoard } from '../hooks/useChessBoard';

describe('useChessBoard', () => {
  it('first click selects origin square', () => {
    const onMoveReady = vi.fn();
    const { result } = renderHook(() => useChessBoard(onMoveReady));
    act(() => result.current.selectSquare('e2'));
    expect(result.current.selectedSquare).toBe('e2');
    expect(onMoveReady).not.toHaveBeenCalled();
  });

  it('second click on different square emits move', () => {
    const onMoveReady = vi.fn();
    const { result } = renderHook(() => useChessBoard(onMoveReady));
    act(() => result.current.selectSquare('e2'));
    act(() => result.current.selectSquare('e4'));
    expect(onMoveReady).toHaveBeenCalledWith({ from: 'e2', to: 'e4' });
    expect(result.current.selectedSquare).toBeNull();
  });

  it('clicking same square twice deselects it', () => {
    const onMoveReady = vi.fn();
    const { result } = renderHook(() => useChessBoard(onMoveReady));
    act(() => result.current.selectSquare('e2'));
    act(() => result.current.selectSquare('e2'));
    expect(result.current.selectedSquare).toBeNull();
    expect(onMoveReady).not.toHaveBeenCalled();
  });

  it('clearSelection resets to null', () => {
    const onMoveReady = vi.fn();
    const { result } = renderHook(() => useChessBoard(onMoveReady));
    act(() => result.current.selectSquare('d4'));
    act(() => result.current.clearSelection());
    expect(result.current.selectedSquare).toBeNull();
  });
});
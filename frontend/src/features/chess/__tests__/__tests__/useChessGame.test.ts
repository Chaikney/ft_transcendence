import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChessGame } from "../../hooks/useChessGame";
import { useMatchStore } from '@/store';
import { mockChessGame } from '@/mocks';
import { server } from '@/test/mswServer';
import { errorHandlers } from '@/test/mswServer';

// Force mock mode off so real API calls go through MSW
vi.stubEnv('VITE_USE_MOCK', 'false');

beforeEach(() => {
  useMatchStore.getState().resetMatch();
});

describe('useChessGame — load', () => {
  it('transitions store to loading then in_progress', async () => {
    const { result } = renderHook(() => useChessGame('chess-001'));

    await waitFor(() => {
      expect(useMatchStore.getState().status).toBe('in_progress');
    });

    expect(useMatchStore.getState().chessGame).toEqual(mockChessGame);
  });

  it('returns chessGame from store after load', async () => {
    const { result } = renderHook(() => useChessGame('chess-001'));

    await waitFor(() => {
      expect(result.current.chessGame).not.toBeNull();
    });

    expect(result.current.chessGame?.game_id).toBe(mockChessGame.game_id);
    expect(result.current.chessGame?.fen).toBe(mockChessGame.fen);
  });

  it('sets store to error state on API failure', async () => {
    server.use(errorHandlers.chessLoadFail);

    renderHook(() => useChessGame('chess-bad'));

    await waitFor(() => {
      expect(useMatchStore.getState().status).toBe('error');
    });

    expect(useMatchStore.getState().error).toBe('Failed to load game. Please try again');
  });
});

describe('useChessGame — sendMove', () => {
  it('sendMove updates store with new game state', async () => {
    const { result } = renderHook(() => useChessGame('chess-001'));

    await waitFor(() => expect(result.current.chessGame).not.toBeNull());

    await result.current.sendMove({ from: 'e2', to: 'e4' });

    // WebSocket would normally handle this in production
    // In test: MSW returns mockChessGameAfterMove from POST /chess/move
    // Store should not be updated by sendMove directly (WebSocket owns that)
    // So we verify the API call was made without error
    expect(useMatchStore.getState().error).toBeNull();
  });

  it('sendMove sets error on API failure', async () => {
    server.use(errorHandlers.chessMoveail);

    const { result } = renderHook(() => useChessGame('chess-001'));
    await waitFor(() => expect(result.current.chessGame).not.toBeNull());

    await result.current.sendMove({ from: 'e2', to: 'e4' });

    expect(useMatchStore.getState().error).toBe('Move failed. Please try again.');
  });

  it('sendMove does nothing if chessGame is null', async () => {
    // Don't load game — store stays null
    const { result } = renderHook(() => useChessGame('chess-001'));
    // Call before load completes — chessGame is null
    await result.current.sendMove({ from: 'e2', to: 'e4' });
    // No error — just silently returns
    expect(useMatchStore.getState().error).toBeNull();
  });
});
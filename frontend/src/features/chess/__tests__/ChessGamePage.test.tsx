import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ChessGamePage } from '../ChessGamePage';
import { useMatchStore } from '@/store';

// 1. Mockeamos la conexión
const mockSubscription = {
  perform: vi.fn(),
  unsubscribe: vi.fn(),
};

vi.mock('@/services/cable', () => ({
  consumer: {
    subscriptions: {
      create: vi.fn(() => mockSubscription),
    },
  },
}));

beforeEach(() => {
  useMatchStore.getState().resetMatch();
  vi.clearAllMocks();
});

// Función auxiliar para renderizar con el router
const renderWithRouter = (gameId: string) => {
  return render(
    <MemoryRouter initialEntries={[`/game/chess/${gameId}`]}>
      <Routes>
        <Route path="/game/chess/:id" element={<ChessGamePage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ChessGamePage — WebSocket Integration', () => {
  it('shows loading state initially', () => {
    renderWithRouter('chess-001');
    expect(screen.getByText(/connecting to game/i)).toBeInTheDocument();
  });

  it('initializes WebSocket connection on mount', () => {
    renderWithRouter('chess-001');
    // Si tu lógica inicial está en el useEffect de useChessGame, 
    // este test confirmará la integración.
    expect(mockSubscription.perform).toHaveBeenCalledWith('get_game_state');
  });
});
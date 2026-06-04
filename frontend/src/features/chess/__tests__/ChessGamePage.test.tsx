import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ChessGamePage } from '../ChessGamePage';
import { useMatchStore } from '@/store';

vi.stubEnv('VITE_USE_MOCK', 'false');

beforeEach(() => {
  useMatchStore.getState().resetMatch();
});

describe('ChessGamePage — full render', () => {
  it('shows loading state initially', () => {
    render(<ChessGamePage gameId="chess-001" />);
    expect(screen.getByText(/loading game/i)).toBeInTheDocument();
  });

  it('renders board after game loads', async () => {
    render(<ChessGamePage gameId="chess-001" />);

    await waitFor(() => {
      expect(screen.queryByText(/loading game/i)).not.toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    // 64 board squares + AI move button = 65
    expect(buttons.length).toBeGreaterThanOrEqual(64);
  });

  it('renders ConnectionStatus component', async () => {
    render(<ChessGamePage gameId="chess-001" />);

    await waitFor(() => {
      expect(screen.queryByText(/loading game/i)).not.toBeInTheDocument();
    });

    // ConnectionStatus renders one of these labels
    const statuses = ['Connecting...', 'Connected', 'Disconnected', 'Reconnecting...'];
    const found = statuses.some((s) => screen.queryByText(s));
    expect(found).toBe(true);
  });

  it('renders Request AI Move button', async () => {
    render(<ChessGamePage gameId="chess-001" />);

    await waitFor(() => {
      expect(screen.queryByText(/loading game/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/request ai move/i)).toBeInTheDocument();
  });

  it('shows turn indicator', async () => {
    render(<ChessGamePage gameId="chess-001" />);

    await waitFor(() => {
      expect(screen.queryByText(/loading game/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/white's turn/i)).toBeInTheDocument();
  });
});
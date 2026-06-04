import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SudokuGamePage } from '../SudokuGamePage';
import { useMatchStore } from '@/store';

vi.stubEnv('VITE_USE_MOCK', 'false');

beforeEach(() => {
  useMatchStore.getState().resetMatch();
});

describe('SudokuGamePage — full render', () => {
  it('shows loading state initially', () => {
    render(<SudokuGamePage gameId="sudoku-001" />);
    expect(screen.getByText(/loading game/i)).toBeInTheDocument();
  });

  it('renders grid after game loads', async () => {
    render(<SudokuGamePage gameId="sudoku-001" />);

    await waitFor(() => {
      expect(screen.queryByText(/loading game/i)).not.toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(81);
  });

  it('renders ConnectionStatus component', async () => {
    render(<SudokuGamePage gameId="sudoku-001" />);

    await waitFor(() => {
      expect(screen.queryByText(/loading game/i)).not.toBeInTheDocument();
    });

    const statuses = ['Connecting...', 'Connected', 'Disconnected', 'Reconnecting...'];
    const found = statuses.some((s) => screen.queryByText(s));
    expect(found).toBe(true);
  });

  it('original cells are locked after load', async () => {
    render(<SudokuGamePage gameId="sudoku-001" />);

    await waitFor(() => {
      expect(screen.queryByText(/loading game/i)).not.toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button').slice(0, 81);
    // (0,0) = 5 in mock — must be disabled
    expect(buttons[0]).toBeDisabled();
  });

  it.skip('empty cells are interactive after load', async () => {
    render(<SudokuGamePage gameId="sudoku-001" />);

    await waitFor(() => {
      expect(screen.queryByText(/loading game/i)).not.toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button').slice(0, 81);
    // (0,2) = 0 in mock — must be enabled
    expect(buttons[2]).not.toBeDisabled();
  });
});
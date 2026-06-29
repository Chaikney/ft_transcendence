import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SudokuGamePage } from '../SudokuGamePage';
import { useMatchStore } from '@/store';

vi.stubEnv('VITE_USE_MOCK', 'false');

beforeEach(() => {
  useMatchStore.getState().resetMatch();
});

// Helper para renderizar con el contexto de la ruta
const renderWithRouter = (gameId: string) => {
  return render(
    <MemoryRouter initialEntries={[`/sudoku/${gameId}`]}>
      <Routes>
        <Route path="/sudoku/:id" element={<SudokuGamePage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('SudokuGamePage — full render', () => {
  it('shows loading state initially', () => {
    renderWithRouter('sudoku-001');
    expect(screen.getByText(/loading game/i)).toBeInTheDocument();
  });

  it('renders grid after game loads', async () => {
    renderWithRouter('sudoku-001');

    await waitFor(() => {
      expect(screen.queryByText(/loading game/i)).not.toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(81);
  });

  it('renders ConnectionStatus component', async () => {
    renderWithRouter('sudoku-001');

    await waitFor(() => {
      expect(screen.queryByText(/loading game/i)).not.toBeInTheDocument();
    });

    const statuses = [/connecting/i, /connected/i, /disconnected/i, /reconnecting/i];
    const found = statuses.some((regex) => screen.queryByText(regex));
    expect(found).toBe(true);
  });

  it('original cells are locked after load', async () => {
    renderWithRouter('sudoku-001');

    await waitFor(() => {
      expect(screen.queryByText(/loading game/i)).not.toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button').slice(0, 81);
    expect(buttons[0]).toBeDisabled();
  });

  it.skip('empty cells are interactive after load', async () => {
    renderWithRouter('sudoku-001');

    await waitFor(() => {
      expect(screen.queryByText(/loading game/i)).not.toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button').slice(0, 81);
    expect(buttons[2]).not.toBeDisabled();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { SudokuBoard } from '../SudokuBoard';
import { mockSudokuGame } from '@/mocks';

const originalGrid = mockSudokuGame.grid.map((row) => [...row]);

describe('SudokuBoard — rendering', () => {
  it('renders 81 cells', () => {
    render(
      <SudokuBoard
        gameState={mockSudokuGame}
        originalGrid={originalGrid}
        onMove={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole('button');
    // 81 cells + 9 number pad = 90 total
    expect(buttons.length).toBeGreaterThanOrEqual(81);
  });

  it('renders non-zero values from grid', () => {
    render(
      <SudokuBoard
        gameState={mockSudokuGame}
        originalGrid={originalGrid}
        onMove={vi.fn()}
      />
    );
    // (0,0) = 5 in mock
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
  });

  it('shows difficulty label when active', () => {
    render(
      <SudokuBoard
        gameState={mockSudokuGame}
        originalGrid={originalGrid}
        onMove={vi.fn()}
      />
    );
    expect(screen.getByText(/difficulty/i)).toBeInTheDocument();
  });

  it('shows number pad when active and not disabled', () => {
    render(
      <SudokuBoard
        gameState={mockSudokuGame}
        originalGrid={originalGrid}
        onMove={vi.fn()}
      />
    );
    const numberPad = screen.getByTestId('number-pad');
    expect(within(numberPad).getByText('1')).toBeInTheDocument();
    expect(within(numberPad).getByText('9')).toBeInTheDocument();
  });

  it('does not show number pad when disabled', () => {
    render(
      <SudokuBoard
        gameState={mockSudokuGame}
        originalGrid={originalGrid}
        onMove={vi.fn()}
        disabled={true}
      />
    );
    const allButtons = screen.getAllByRole('button');
    expect(allButtons).toHaveLength(81); // no number pad
  });
});

describe('SudokuBoard — interaction', () => {
  it('locked cells are disabled', () => {
    render(
      <SudokuBoard
        gameState={mockSudokuGame}
        originalGrid={originalGrid}
        onMove={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole('button').slice(0, 81);
    // (0,0) = 5 — locked
    expect(buttons[0]).toBeDisabled();
  });

  it('empty cells are not disabled', () => {
    render(
      <SudokuBoard
        gameState={mockSudokuGame}
        originalGrid={originalGrid}
        onMove={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole('button').slice(0, 81);
    // (0,2) = 0 — unlocked
    expect(buttons[2]).not.toBeDisabled();
  });

  it('number pad click emits move with correct payload', () => {
    const onMove = vi.fn();
    render(
      <SudokuBoard
        gameState={mockSudokuGame}
        originalGrid={originalGrid}
        onMove={onMove}
      />
    );
    const buttons = screen.getAllByRole('button');
    // Select empty cell (0,2)
    fireEvent.click(buttons[2]);
    // Click number pad "4" (last 9 buttons)
    const padButtons = buttons.slice(-9);
    fireEvent.click(padButtons[3]); // value = 4
    expect(onMove).toHaveBeenCalledWith({
      game_id: mockSudokuGame.game_id,
      row: 0,
      col: 2,
      value: 4,
    });
  });

  it('does not emit if locked cell clicked then number pad used', () => {
    const onMove = vi.fn();
    render(
      <SudokuBoard
        gameState={mockSudokuGame}
        originalGrid={originalGrid}
        onMove={onMove}
      />
    );
    const buttons = screen.getAllByRole('button');
    // Try to select locked cell (0,0) — should not work
    fireEvent.click(buttons[0]);
    const padButtons = buttons.slice(-9);
    fireEvent.click(padButtons[0]);
    expect(onMove).not.toHaveBeenCalled();
  });
});

describe('SudokuBoard — keyboard', () => {
  it('keyboard number input emits move on selected cell', () => {
    const onMove = vi.fn();
    render(
      <SudokuBoard
        gameState={mockSudokuGame}
        originalGrid={originalGrid}
        onMove={onMove}
      />
    );
    const buttons = screen.getAllByRole('button').slice(0, 81);
    fireEvent.click(buttons[2]); // select (0,2)
    fireEvent.keyDown(window, { key: '7' });
    expect(onMove).toHaveBeenCalledWith({
      game_id: mockSudokuGame.game_id,
      row: 0,
      col: 2,
      value: 7,
    });
  });
});
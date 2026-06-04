import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChessBoard } from '../ChessBoard';
import { mockChessGame, mockChessGameAfterMove, mockChessGameCheckmate } from '@/mocks';

describe('ChessBoard — rendering', () => {
  it('renders 64 squares', () => {
    render(<ChessBoard gameState={mockChessGame} onMove={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(64);
  });

  it('shows white turn indicator when turn is white', () => {
    render(<ChessBoard gameState={mockChessGame} onMove={vi.fn()} />);
    expect(screen.getByText(/white's turn/i)).toBeInTheDocument();
  });

  it('shows black turn indicator after move', () => {
    render(<ChessBoard gameState={mockChessGameAfterMove} onMove={vi.fn()} />);
    expect(screen.getByText(/black's turn/i)).toBeInTheDocument();
  });

  it('shows game over when status is checkmate', () => {
    render(<ChessBoard gameState={mockChessGameCheckmate} onMove={vi.fn()} />);
    expect(screen.getByText(/game over/i)).toBeInTheDocument();
  });

  it('renders file labels a through h', () => {
    render(<ChessBoard gameState={mockChessGame} onMove={vi.fn()} />);
    ['a','b','c','d','e','f','g','h'].forEach((f) => {
      expect(screen.getByText(f)).toBeInTheDocument();
    });
  });
});

describe('ChessBoard — interaction', () => {
  it('calls onMove with correct from/to on two clicks', () => {
    const onMove = vi.fn();
    render(<ChessBoard gameState={mockChessGame} onMove={onMove} />);
    const buttons = screen.getAllByRole('button');
    // e2 = row 6, col 4 = index 52. e4 = row 4, col 4 = index 36
    fireEvent.click(buttons[52]); // e2
    fireEvent.click(buttons[36]); // e4
    expect(onMove).toHaveBeenCalledWith({ from: 'e2', to: 'e4' });
  });

  it('does not call onMove on first click', () => {
    const onMove = vi.fn();
    render(<ChessBoard gameState={mockChessGame} onMove={onMove} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[52]);
    expect(onMove).not.toHaveBeenCalled();
  });

  it('all squares disabled when disabled=true', () => {
    render(<ChessBoard gameState={mockChessGame} onMove={vi.fn()} disabled={true} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('all squares disabled when game status is checkmate', () => {
    render(<ChessBoard gameState={mockChessGameCheckmate} onMove={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('does not call onMove when disabled', () => {
    const onMove = vi.fn();
    render(<ChessBoard gameState={mockChessGame} onMove={onMove} disabled={true} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[52]);
    fireEvent.click(buttons[36]);
    expect(onMove).not.toHaveBeenCalled();
  });
});
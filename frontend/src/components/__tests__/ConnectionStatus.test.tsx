import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConnectionStatus } from '../ConnectionStatus';

describe('ConnectionStatus', () => {
  it('shows Connecting... label', () => {
    render(<ConnectionStatus status="connecting" />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('shows Connected label', () => {
    render(<ConnectionStatus status="connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows Disconnected label', () => {
    render(<ConnectionStatus status="disconnected" />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('shows Reconnecting... label', () => {
    render(<ConnectionStatus status="reconnecting" />);
    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
  });

  it('indicator has animate-pulse when connecting', () => {
    const { container } = render(<ConnectionStatus status="connecting" />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('indicator has no animate-pulse when connected', () => {
    const { container } = render(<ConnectionStatus status="connected" />);
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
// Mock Next.js app router before importing the component under test
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() })
}));
import GameOver from '@/components/game/GameOver';
import { useGameStore } from '@/store/gameStore';

// Smoke test: ensures dialog roles and key CTAs render

describe('GameOver', () => {
  it('renders dialog with title and action buttons', async () => {
    const store = useGameStore.getState();
    store.resetGame();
    render(<GameOver score={1000} streak={5} celebrationLevel="good" />);

    expect(screen.getByRole('dialog', { name: /game over/i })).toBeInTheDocument();
    expect(screen.getByText(/final score/i)).toBeInTheDocument();
    await screen.findByRole('button', { name: /play again/i }, { timeout: 3000 });
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });
});

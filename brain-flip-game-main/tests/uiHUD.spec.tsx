import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameHUD from '@/components/game/GameHUD';
import { useGameStore } from '@/store/gameStore';

// Minimal render smoke test to ensure HUD mounts and basic a11y labels exist

describe('GameHUD', () => {
  it('renders score and timer regions', () => {
    const store = useGameStore.getState();
    store.resetGame();
    render(<GameHUD /> as any);

    expect(screen.getByRole('region', { name: /score/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /time/i })).toBeInTheDocument();
    // Lives group
    expect(screen.getByRole('group', { name: /lives/i })).toBeInTheDocument();
  });
});

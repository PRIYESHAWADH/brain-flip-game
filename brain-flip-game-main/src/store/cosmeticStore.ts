import { create } from 'zustand';

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'avatar' | 'theme' | 'effect';
  costGP?: number; // cost in Game Points
  costSC?: number; // cost in Star Coins
  limited?: boolean;
  owned?: boolean;
}

interface CosmeticStoreState {
  items: CosmeticItem[];
  toggleOwned: (id: string) => void;
  addItems: (list: CosmeticItem[]) => void;
}

export const useCosmeticStore = create<CosmeticStoreState>((set) => ({
  items: [],
  toggleOwned: (id) => set(state => ({
    items: state.items.map(i => i.id === id ? { ...i, owned: !i.owned } : i)
  })),
  addItems: (list) => set(state => ({
    items: [...state.items, ...list.filter(n => !state.items.some(i => i.id === n.id))]
  }))
}));
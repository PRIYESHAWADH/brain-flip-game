import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GlobalEvent {
  id: string;
  title: string;
  target: number; // total community actions required
  progress: number; // current contributions
  endsAt?: string;
}

interface GlobalEventState {
  active?: GlobalEvent;
  contribute: (amount?: number) => void;
  setActive: (event: GlobalEvent | undefined) => void;
}

export const useGlobalEventStore = create<GlobalEventState>()(
  persist(
    (set, get) => ({
      active: undefined,
      contribute: (amount = 1) => {
        if (!e) return;
        set({ active: next });
      },
      setActive: (event) => set({ active: event })
    }),
    { name: 'bf-global-event', version: 1 }
  )
);

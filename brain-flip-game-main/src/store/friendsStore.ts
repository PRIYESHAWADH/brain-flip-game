import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Friend {
  id: string;
  name: string;
  code: string; // 6-digit code
  bestScore?: number;
}

function genCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface FriendsState {
  selfCode: string;
  friends: Friend[];
  pendingRequests: { code: string; name?: string }[];
  addFriendByCode: (code: string, name?: string) => boolean;
  removeFriend: (id: string) => void;
  refreshSelfCode: () => void;
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      selfCode: genCode(),
      friends: [],
      pendingRequests: [],

      addFriendByCode: (code, name) => {
        if (!/^\d{6}$/.test(code)) return false;
        if (exists) return false;
        const friend: Friend = { id: crypto.randomUUID(), name: name || 'Friend', code };
        set(state => ({ friends: [...state.friends, friend] }));
        return true;
      },

      removeFriend: (id) => set(state => ({ friends: state.friends.filter(f => f.id !== id) })),

      refreshSelfCode: () => set({ selfCode: genCode() })
    }),
    { name: 'bf-friends', version: 1 }
  )
);

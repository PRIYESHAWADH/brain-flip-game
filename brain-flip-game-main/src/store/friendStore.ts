import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Friend {
  id: string;
  name: string;
  code: string; // 6-digit invite code
  lastSeen: string;
  isOnline?: boolean;
  bestScore?: number;
}

interface FriendStore {
  friends: Friend[];
  myInviteCode: string;
  addFriendByCode: (code: string, name?: string) => boolean;
  removeFriend: (id: string) => void;
  generateNewCode: () => void;
  updateFriendActivity: (id: string, bestScore?: number) => void;
}

function randomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const useFriendStore = create<FriendStore>()(
  persist(
    (set, get) => ({
      friends: [],
      myInviteCode: randomCode(),
      addFriendByCode: (code, name) => {
        if (!/^[0-9]{6}$/.test(code)) return false;
        if (exists) return false;
        const friend: Friend = {
          id: crypto.randomUUID(),
          name: name || `Player ${code.slice(0,3)}`,
          code,
          lastSeen: new Date().toISOString(),
          isOnline: false,
          bestScore: 0
        };
        set(state => ({ friends: [...state.friends, friend] }));
        return true;
      },
      removeFriend: (id) => set(state => ({ friends: state.friends.filter(f => f.id !== id) })),
      generateNewCode: () => set({ myInviteCode: randomCode() }),
      updateFriendActivity: (id, bestScore) => set(state => ({
        friends: state.friends.map(f => f.id === id ? {
          ...f,
          lastSeen: new Date().toISOString(),
          isOnline: true,
          bestScore: Math.max(f.bestScore || 0, bestScore || 0)
        } : f)
      })),
    }),
    { name: 'brain-flip-friends', version: 1 }
  )
);

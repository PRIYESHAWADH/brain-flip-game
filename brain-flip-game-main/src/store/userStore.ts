import { create } from 'zustand';
import { UserProfile } from '@/types/user';

interface UserStore {
	user: UserProfile | null;
	setUser: (user: UserProfile | null) => void;
	logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
	user: null,
	setUser: (user) => set({ user }),
	logout: () => set({ user: null }),
}));

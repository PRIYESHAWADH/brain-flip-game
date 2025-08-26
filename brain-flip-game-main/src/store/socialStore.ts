import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Friend {
  id: string;
  inviteCode: string;
  nickname: string;
  avatar?: string;
  lastSeen: string;
  bestScore: number;
  currentStreak: number;
  gamesPlayed: number;
  isOnline: boolean;
}

export interface FriendInvite {
  id: string;
  fromCode: string;
  fromNickname: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface FriendsState {
  myInviteCode: string;
  myNickname: string;
  friends: Friend[];
  pendingInvites: FriendInvite[];
  
  generateInviteCode: () => string;
  addFriend: (inviteCode: string) => boolean;
  removeFriend: (friendId: string) => void;
  updateMyNickname: (nickname: string) => void;
  sendInvite: (toCode: string) => boolean;
  acceptInvite: (inviteId: string) => void;
  declineInvite: (inviteId: string) => void;
  updateFriendStats: (friendId: string, stats: Partial<Friend>) => void;
}

// Generate a 6-digit invite code
function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      myInviteCode: generateCode(),
      myNickname: 'Player',
      friends: [],
      pendingInvites: [],
      
      generateInviteCode: () => {
        set({ myInviteCode: newCode });
        return newCode;
      },
      
      addFriend: (inviteCode: string) => {
        const { friends, myInviteCode } = get();
        
        if (inviteCode === myInviteCode) return false; // Can't add self
        if (friends.some(f => f.inviteCode === inviteCode)) return false; // Already friends
        
        const newFriend: Friend = {
          id: `friend-${Date.now()}`,
          inviteCode,
          nickname: `Friend-${inviteCode}`,
          lastSeen: new Date().toISOString(),
          bestScore: 0,
          currentStreak: 0,
          gamesPlayed: 0,
          isOnline: false
        };
        
        set({ friends: [...friends, newFriend] });
        return true;
      },
      
      removeFriend: (friendId: string) => {
        set(state => ({
          friends: state.friends.filter(f => f.id !== friendId)
        }));
      },
      
      updateMyNickname: (nickname: string) => {
        set({ myNickname: nickname.slice(0, 20) }); // Max 20 chars
      },
      
      sendInvite: (toCode: string) => {
        const { myInviteCode, myNickname, pendingInvites } = get();
        
        if (toCode === myInviteCode) return false;
        if (pendingInvites.some(inv => inv.fromCode === toCode)) return false;
        
        // In a real app, this would send via network
        // For now, just track locally
        return true;
      },
      
      acceptInvite: (inviteId: string) => {
        const { pendingInvites } = get();
        
        if (invite) {
          get().addFriend(invite.fromCode);
          set(state => ({
            pendingInvites: state.pendingInvites.map(inv =>
              inv.id === inviteId ? { ...inv, status: 'accepted' } : inv
            )
          }));
        }
      },
      
      declineInvite: (inviteId: string) => {
        set(state => ({
          pendingInvites: state.pendingInvites.map(inv =>
            inv.id === inviteId ? { ...inv, status: 'declined' } : inv
          )
        }));
      },
      
      updateFriendStats: (friendId: string, stats: Partial<Friend>) => {
        set(state => ({
          friends: state.friends.map(f =>
            f.id === friendId ? { ...f, ...stats } : f
          )
        }));
      }
    }),
    {
      name: 'brain-flip-friends',
      version: 1
    }
  )
);

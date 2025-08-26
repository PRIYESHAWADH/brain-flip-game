"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { worldClassSupabase } from '@/lib/supabase-enhanced';
import { useAuth } from '@/hooks/useAuth';

interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    level: number;
    bestScore: number;
    totalGamesPlayed: number;
  };
}

interface Challenge {
  id: string;
  challengerId: string;
  challengedId: string;
  gameMode: 'classic' | 'duel' | 'sudden-death';
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  challengerScore?: number;
  challengedScore?: number;
  createdAt: string;
  expiresAt: string;
  challenger: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  challenged: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

interface WorldClassSocialProps {
  showFriends?: boolean;
  showChallenges?: boolean;
  showLeaderboard?: boolean;
}

export default function WorldClassSocial({ 
  showFriends = true, 
  showChallenges = true, 
  showLeaderboard = true 
}: WorldClassSocialProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'challenges' | 'leaderboard'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSocialData();
    }
  }, [user, activeTab]);
    try {
      setLoading(true);
      
      if (activeTab === 'friends') {
        await fetchFriends();
      } else if (activeTab === 'challenges') {
        await fetchChallenges();
      }
      
      setError(null);
    } catch (err: unknown) {
      setError(err.message);
      console.error('Social data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
    if (response.ok) {
      setFriends(result.data || []);
    }
  };
    if (response.ok) {
      setChallenges(result.data || []);
    }
  };
    try {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendUsername })
      });
      
      if (response.ok) {
        setShowAddFriend(false);
        setSearchQuery('');
        await fetchFriends();
      }
    } catch (err: unknown) {
      setError(err.message);
    }
  };
    try {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: accept ? 'accept' : 'decline' })
      });
      
      if (response.ok) {
        await fetchFriends();
      }
    } catch (err: unknown) {
      setError(err.message);
    }
  };
    try {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId, gameMode })
      });
      
      if (response.ok) {
        await fetchChallenges();
      }
    } catch (err: unknown) {
      setError(err.message);
    }
  };
    try {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: accept ? 'accept' : 'decline' })
      });
      
      if (response.ok) {
        await fetchChallenges();
      }
    } catch (err: unknown) {
      setError(err.message);
    }
  };
    friend.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-4xl mb-4">👥</div>
        <div className="text-xl text-gray-300">Loading social features...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          👥 Social Hub
        </h2>
        
        {/* Tab Navigation */}
        <div className="flex gap-2">
          {showFriends && (
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Friends
            </button>
          )}
          {showChallenges && (
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'challenges'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Challenges
              {pendingChallenges.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingChallenges.length}
                </span>
              )}
            </button>
          )}
          {showLeaderboard && (
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Leaderboard
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border border-red-500/20 bg-red-500/10"
        >
          <div className="text-red-400 text-center">❌ {error}</div>
        </motion.div>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && showFriends && (
        <div className="space-y-6">
          {/* Add Friend Section */}
          <div className="glass-card p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Add Friends</h3>
              <button
                onClick={() => setShowAddFriend(!showAddFriend)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                {showAddFriend ? 'Cancel' : '+ Add Friend'}
              </button>
            </div>
            
            {showAddFriend && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter friend's username..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                />
                <button
                  onClick={() => sendFriendRequest(searchQuery)}
                  disabled={!searchQuery.trim()}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
                >
                  Send Friend Request
                </button>
              </motion.div>
            )}
          </div>

          {/* Pending Friend Requests */}
          {pendingFriendRequests.length > 0 && (
            <div className="glass-card p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4">Pending Requests</h3>
              <div className="space-y-3">
                {pendingFriendRequests.map((friend) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {friend.user.displayName?.charAt(0) || friend.user.username?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{friend.user.displayName}</div>
                        <div className="text-sm text-gray-400">@{friend.user.username}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondToFriendRequest(friend.id, true)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respondToFriendRequest(friend.id, false)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="glass-card p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">
              Friends ({acceptedFriends.length})
            </h3>
            {acceptedFriends.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👥</div>
                <div className="text-gray-300">No friends yet. Add some friends to get started!</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedFriends.map((friend) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {friend.user.displayName?.charAt(0) || friend.user.username?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{friend.user.displayName}</div>
                        <div className="text-sm text-gray-400">@{friend.user.username}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <div className="text-gray-400">Level</div>
                        <div className="text-blue-400 font-bold">{friend.user.level}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Best Score</div>
                        <div className="text-yellow-400 font-bold">{friend.user.bestScore.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => sendChallenge(friend.id, 'classic')}
                        className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm"
                      >
                        Challenge
                      </button>
                      <button
                        onClick={() => {/* View profile */}}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                      >
                        Profile
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && showChallenges && (
        <div className="space-y-6">
          <div className="glass-card p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4">
              Challenges ({challenges.length})
            </h3>
            {challenges.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚔️</div>
                <div className="text-gray-300">No challenges yet. Challenge your friends to a game!</div>
              </div>
            ) : (
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {challenge.gameMode === 'classic' ? '🎯' : 
                           challenge.gameMode === 'duel' ? '⚔️' : '💀'}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {challenge.challenger.displayName} vs {challenge.challenged.displayName}
                          </div>
                          <div className="text-sm text-gray-400">
                            {challenge.gameMode.replace('-', ' ')} • {new Date(challenge.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {challenge.status === 'pending' && challenge.challengedId === user?.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => respondToChallenge(challenge.id, true)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondToChallenge(challenge.id, false)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      
                      {challenge.status === 'completed' && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-400">
                            {challenge.challengerScore} - {challenge.challengedScore}
                          </div>
                          <div className="text-sm text-gray-400">Final Score</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && showLeaderboard && (
        <div className="glass-card p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold text-white mb-4">🏆 Friends Leaderboard</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏆</div>
            <div className="text-gray-300">Friends leaderboard coming soon!</div>
          </div>
        </div>
      )}
    </div>
  );
}

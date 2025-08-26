"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFriendStore } from '@/store/friendStore';

export default function FriendsPanel() {
  const { friends, myInviteCode, addFriendByCode, removeFriend, generateNewCode } = useFriendStore();
  const [code, setCode] = useState('');
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
    setFeedback(ok ? 'Friend added!' : 'Invalid or duplicate code');
    if (ok) setCode('');
    setTimeout(() => setFeedback(null), 1500);
  };

  return (
    <div className="fixed right-4 bottom-20 z-40">
      <button className="glass-card px-3 py-2 text-sm" onClick={() => setOpen(v => !v)}>Friends</button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 w-72 glass-card p-3"
          >
            <div className="text-xs text-text-muted mb-1">Your Invite Code</div>
            <div className="flex items-center gap-2 mb-3">
              <div className="font-mono font-bold text-neon-yellow text-lg">{myInviteCode}</div>
              <button className="text-xs text-text-muted hover:text-white" onClick={generateNewCode}>New</button>
            </div>
            <div className="flex gap-2 mb-3">
              <input className="flex-1 bg-bg-tertiary px-2 py-1 rounded text-sm outline-none" placeholder="Enter 6-digit code" value={code} onChange={e => setCode(e.target.value)} />
              <button className="btn-primary px-2 py-1 text-sm" onClick={add}>Add</button>
            </div>
            {feedback && <div className="text-xs text-neon-green mb-2">{feedback}</div>}
            <div className="text-xs text-text-muted mb-1">Friends</div>
            <div className="max-h-56 overflow-auto space-y-2">
              {friends.length === 0 && <div className="text-text-secondary text-xs">No friends yet.</div>}
              {friends.map(f => (
                <div key={f.id} className="flex items-center justify-between bg-bg-tertiary rounded px-2 py-1">
                  <div>
                    <div className="font-semibold">{f.name}</div>
                    <div className="text-[10px] text-text-muted">Best: {f.bestScore?.toLocaleString?.() || 0}</div>
                  </div>
                  <button className="text-xs text-brain-danger hover:text-white" onClick={() => removeFriend(f.id)}>Remove</button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

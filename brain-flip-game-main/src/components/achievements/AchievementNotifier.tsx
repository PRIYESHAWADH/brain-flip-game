'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Achievement, useAchievementStore } from '@/store/achievementStore';
import AchievementNotification from './AchievementNotification';

export default function AchievementNotifier() {
    const [queue, setQueue] = useState<Achievement[]>([]);
    const [showing, setShowing] = useState<Achievement | null>(null);
    const checkAchievements = useAchievementStore(state => state.checkAchievements);

    // Subscribe to achievement updates
    useEffect(() => {
        // Check achievements whenever game stats update
        const unsubscribe = useAchievementStore.subscribe(
            (state) => {
                const { stats } = state;
                const newlyUnlocked = checkAchievements({
                    fastestTime: stats.fastestTime,
                    highestAccuracy: stats.highestAccuracy,
                    bestStreak: stats.bestStreak,
                    battlesWon: stats.battlesWon,
                    lessonsCompleted: stats.lessonsCompleted,
                    totalPoints: stats.totalPoints
                });

                // Add new achievements to queue
                if (newlyUnlocked.length > 0) {
                    setQueue(q => [...q, ...newlyUnlocked]);
                }
            },
            state => state.stats
        );

        return () => {
            unsubscribe();
        };
    }, [checkAchievements]);

    // Process queue
    useEffect(() => {
        if (queue.length > 0 && !showing) {
            const [next, ...rest] = queue;
            setShowing(next);
            setQueue(rest);
        }
    }, [queue, showing]);

    const handleClose = () => {
        setShowing(null);
    };

    return (
        <AnimatePresence>
            {showing && (
                <AchievementNotification
                    key={showing.id}
                    achievement={showing}
                    onClose={handleClose}
                />
            )}
        </AnimatePresence>
    );
}

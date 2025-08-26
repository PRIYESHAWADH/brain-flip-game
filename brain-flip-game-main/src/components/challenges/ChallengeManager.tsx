'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDailyChallengeStore, DailyChallenge } from '@/store/dailyChallengeStore';
import { useGameStore } from '@/store/gameStore';
import ChallengeNotification from './ChallengeNotification';

export default function ChallengeManager() {
  // Store hooks
  const dailyStore = useDailyChallengeStore();
  const gameStore = useGameStore();

  // Destructure needed values and functions
  const { updateChallengeProgress, updateDailyProgress, addToGlobalJackpot } = dailyStore;
  const { 
    streak, 
    score, 
    reactionTimes, 
    perfectRounds,
    addPoints,
    addStarCoins
  } = gameStore;

  // Refs for handling staggered animations
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Queue system for notifications
  const [notificationQueue, setNotificationQueue] = useState<DailyChallenge[]>([]);
  const [activeNotification, setActiveNotification] = useState<DailyChallenge | null>(null);

  // Process game end and update challenges
  const processGameEnd = useCallback(() => {
    const avgReactionTime = reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    
    // Update daily progress in store
    updateDailyProgress({
      streak,
      score,
      reactionTime: avgReactionTime,
      perfectRounds,
      correctAnswers: streak,
      totalAnswers: reactionTimes.length
    });
    
    // Update challenge progress
    return updateChallengeProgress({
      streak,
      score,
      reactionTime: avgReactionTime,
      perfectRounds,
      gamesPlayed: 1,
      accuracy: reactionTimes.length > 0 ? (streak / reactionTimes.length) * 100 : 0
    });
  }, [
    streak, 
    score, 
    reactionTimes, 
    perfectRounds, 
    updateDailyProgress, 
    updateChallengeProgress
  ]);

  // Process notification queue
  useEffect(() => {
    if (notificationQueue.length > 0 && !activeNotification) {
      const nextNotification = notificationQueue[0];
      setActiveNotification(nextNotification);
      setNotificationQueue(prev => prev.slice(1));
    }
  }, [notificationQueue, activeNotification]);

  // Handle notification close
  const handleNotificationClose = useCallback(() => {
    setActiveNotification(null);
  }, []);

  // Handle game completion and rewards
  useEffect(() => {
    if (score > 0) { // Only process if a game was played
      const newlyCompleted = processGameEnd();
      
      if (newlyCompleted.length > 0) {
        setNotificationQueue(prev => [...prev, ...newlyCompleted]);
        
        // Stagger rewards for better UX
        newlyCompleted.forEach((challenge, index) => {
          setTimeout(() => {
            // Add base rewards
            addPoints(challenge.reward.points);
            addStarCoins(challenge.reward.starCoins);
            
            // Handle bonus multiplier
            if (challenge.reward.bonusMultiplier && challenge.reward.bonusMultiplier > 1) {
              const bonusPoints = Math.floor(score * (challenge.reward.bonusMultiplier - 1));
              addPoints(bonusPoints);
              
              // Play celebration sound
              try {
                const audio = new Audio('/audio/game/bonus-multiplier.mp3');
                audio.volume = 0.6;
                audio.play().catch(() => {});
              } catch (error) {
                console.warn('Audio playback failed:', error);
              }
            }
          }, 1000 + (index * 500)); // Stagger by 500ms each
        });

        // Contribute to jackpot based on performance
        const jackpotContribution = Math.floor(score * (1 + streak / 100));
        addToGlobalJackpot(jackpotContribution);
      }
    }
  }, [score, streak, processGameEnd, addPoints, addStarCoins, addToGlobalJackpot]);

  return (
    <>
      {activeNotification && (
        <ChallengeNotification
          challenge={activeNotification}
          onClose={handleNotificationClose}
        />
      )}
    </>
  );






  useEffect(() => {
    // Process game end results
    const newlyCompleted = processGameEnd();
    
    // Process newly completed challenges
    if (newlyCompleted.length > 0) {
      newlyCompleted.forEach(challenge => {
        // Award points and star coins
        addPoints(challenge.reward.points);
        addStarCoins(challenge.reward.starCoins);
        
        // Add to global jackpot (small contribution from each completion)
        addToGlobalJackpot(Math.floor(challenge.reward.points * 0.1));
        
        // Show notification after a short delay
        setTimeout(() => {
          setCompletedChallenges(prev => [...prev, challenge]);
        }, 1000);
      });
    }
  }, [addPoints, addStarCoins, addToGlobalJackpot, processGameEnd]);

  // Remove notification after it's closed
  const removeNotification = (challengeId: string) => {
    setCompletedChallenges(prev => 
      prev.filter(challenge => challenge.id !== challengeId)
    );
  };

  return (
    <>
      {completedChallenges.map(challenge => (
        <ChallengeNotification
          key={challenge.id}
          challenge={challenge}
          onClose={() => removeNotification(challenge.id)}
        />
      ))}
    </>
  );
}
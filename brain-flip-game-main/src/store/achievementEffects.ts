import { Achievement } from './achievementStore';
import { AnimationVariants } from '@/motion/variants';

export const getTierColor = (tier: Achievement['tier']) => {
    switch (tier) {
        case 'bronze': return 'from-orange-500 to-orange-700';
        case 'silver': return 'from-slate-400 to-slate-600';
        case 'gold': return 'from-yellow-400 to-yellow-600';
        case 'diamond': return 'from-cyan-400 to-blue-600';
        case 'legendary': return 'from-purple-500 to-pink-600';
    }
};

export const tierEffects = {
    bronze: {
        glow: 'shadow-orange-500/50',
        particles: '✨',
        animation: 'animate-bounce',
        variant: AnimationVariants.popFade
    },
    silver: {
        glow: 'shadow-slate-400/50',
        particles: '⭐',
        animation: 'animate-pulse',
        variant: AnimationVariants.slideUp
    },
    gold: {
        glow: 'shadow-yellow-400/50',
        particles: '🌟',
        animation: 'animate-spin',
        variant: AnimationVariants.swingIn
    },
    diamond: {
        glow: 'shadow-blue-400/50',
        particles: '💫',
        animation: 'animate-ping',
        variant: AnimationVariants.bounceScale
    },
    legendary: {
        glow: 'shadow-purple-500/50',
        particles: '🌠',
        animation: 'animate-bounce',
        variant: AnimationVariants.explosiveReveal
    }
} as const;

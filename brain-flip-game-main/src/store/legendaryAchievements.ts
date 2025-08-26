// Additional achievements for dedicated players
const LEGENDARY_ACHIEVEMENTS = [
    {
        id: 'speed_god',
        name: 'Speed God',
        description: 'React in under 150ms',
        icon: '⚡️',
        tier: 'legendary',
        requirement: { type: 'speed', target: 150 },
        reward: { points: 3000, starCoins: 20, cosmetic: 'rainbow_trail' },
        unlocked: false,
        progress: 0
    },
    {
        id: 'perfect_master',
        name: 'Perfect Master',
        description: 'Complete 50 perfect rounds',
        icon: '🌈',
        tier: 'legendary',
        requirement: { type: 'perfect', target: 50 },
        reward: { points: 5000, starCoins: 25, cosmetic: 'perfect_aura' },
        unlocked: false,
        progress: 0
    },
    {
        id: 'dedication',
        name: 'Dedication',
        description: 'Maintain a 30-day streak',
        icon: '🌠',
        tier: 'legendary',
        requirement: { type: 'daily', target: 30 },
        reward: { points: 10000, starCoins: 50, cosmetic: 'star_trail' },
        unlocked: false,
        progress: 0
    }
] as const;

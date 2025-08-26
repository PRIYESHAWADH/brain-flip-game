import { Variants } from 'framer-motion';

export const AnimationVariants = {
    popFade: {
        initial: { scale: 0.3, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.5, opacity: 0 }
    },
    slideUp: {
        initial: { y: 50, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -50, opacity: 0 }
    },
    swingIn: {
        initial: { rotate: -45, scale: 0, opacity: 0 },
        animate: { 
            rotate: 0, 
            scale: 1, 
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 15
            }
        },
        exit: { rotate: 45, scale: 0, opacity: 0 }
    },
    bounceScale: {
        initial: { scale: 0 },
        animate: {
            scale: [0, 1.2, 1],
            transition: {
                times: [0, 0.6, 1],
                type: 'spring',
                stiffness: 300,
                damping: 10
            }
        },
        exit: { scale: 0 }
    },
    explosiveReveal: {
        initial: { scale: 0.1, opacity: 0, filter: 'blur(20px)' },
        animate: {
            scale: [0.1, 1.2, 1],
            opacity: [0, 1, 1],
            filter: ['blur(20px)', 'blur(0px)', 'blur(0px)'],
            transition: {
                duration: 0.8,
                times: [0, 0.7, 1],
                ease: 'easeOut'
            }
        },
        exit: {
            scale: 1.5,
            opacity: 0,
            filter: 'blur(10px)',
            transition: {
                duration: 0.3,
                ease: 'easeIn'
            }
        }
    }
} as const;

// Shared animation configs
export const sharedTransitions = {
    duration: 0.5,
    ease: [0.43, 0.13, 0.23, 0.96]
};

// Custom animation for achievement unlocks
export const achievementAnimation: Variants = {
    initial: {
        y: 50,
        x: 50,
        scale: 0.3,
        opacity: 0
    },
    animate: {
        y: 0,
        x: 0,
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.5,
            type: 'spring',
            stiffness: 300,
            damping: 20
        }
    },
    exit: {
        y: -50,
        x: 50,
        scale: 0.3,
        opacity: 0,
        transition: {
            duration: 0.3
        }
    }
};

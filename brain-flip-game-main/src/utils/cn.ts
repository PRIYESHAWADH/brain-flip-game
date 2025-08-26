/**
 * Utility for merging CSS classes with clsx and tailwind-merge
 */

import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge CSS classes with proper Tailwind CSS class deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create conditional class names based on variants
 */
export function createVariants<T extends Record<string, any>>(
  base: string,
  variants: T
) {
  return (props: { [K in keyof T]?: keyof T[K] } & { className?: string }) => {
      return propValue && value[propValue as keyof typeof value];
    });

    return cn(base, ...variantClasses, props.className);
  };
}

/**
 * Design token CSS variable helper
 */
export function token(tokenName: string) {
  return `var(--${tokenName})`;
}

/**
 * Create responsive class names
 */
export function responsive(classes: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}) {
  return cn(
    classes.base,
    classes.sm && `sm:${classes.sm}`,
    classes.md && `md:${classes.md}`,
    classes.lg && `lg:${classes.lg}`,
    classes.xl && `xl:${classes.xl}`,
    classes['2xl'] && `2xl:${classes['2xl']}`
  );
}

/**
 * Focus ring utility with design tokens
 */
export function focusRing(color: string = 'primary') {
  return cn(
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    `focus-visible:ring-[var(--color-${color})]`
  );
}

/**
 * Glass effect utility
 */
export function glassEffect(intensity: 'light' | 'medium' | 'strong' = 'medium') {
    light: 'bg-[var(--color-surface-primary)]',
    medium: 'bg-[var(--color-surface-secondary)]',
    strong: 'bg-[var(--color-surface-tertiary)]'
  };

  return cn(
    intensityMap[intensity],
    'border border-[var(--color-border-primary)]',
    'backdrop-blur-sm',
    'shadow-[var(--shadow-component-md)]'
  );
}

/**
 * Neon glow effect utility
 */
export function neonGlow(color: 'primary' | 'success' | 'warning' | 'danger' = 'primary') {
    primary: 'shadow-[var(--shadow-neon-primary)]',
    success: 'shadow-[var(--shadow-neon-success)]',
    warning: 'shadow-[var(--shadow-neon-warning)]',
    danger: 'shadow-[var(--shadow-neon-danger)]'
  };

  return glowMap[color];
}

/**
 * Animation utility with reduced motion support
 */
export function animation(animationClass: string, reducedMotionFallback?: string) {
  return cn(
    animationClass,
    reducedMotionFallback && `motion-reduce:${reducedMotionFallback}`
  );
}
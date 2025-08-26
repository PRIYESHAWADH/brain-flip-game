import { ReactNode, forwardRef } from 'react';
import { cn, glassEffect, focusRing } from '@/utils/cn';

export interface CardProps {
	children: ReactNode;
	className?: string;
	variant?: 'default' | 'glass' | 'solid' | 'outlined';
	padding?: 'none' | 'sm' | 'md' | 'lg';
	interactive?: boolean;
	onClick?: () => void;
	'aria-label'?: string;
}
	children,
	className,
	variant = 'glass',
	padding = 'lg',
	interactive = false,
	onClick,
	'aria-label': ariaLabel,
	...props
}, ref) => {
		// Base styles
		'rounded-xl transition-all duration-300',
		
		// Variant styles
		variant === 'default' && 'bg-card-bg shadow-lg backdrop-blur-xs',
		variant === 'glass' && glassEffect('medium'),
		variant === 'solid' && 'bg-[var(--color-surface-tertiary)] shadow-[var(--shadow-component-lg)]',
		variant === 'outlined' && 'border-2 border-[var(--color-border-primary)] bg-transparent',
		
		// Padding variants
		padding === 'none' && 'p-0',
		padding === 'sm' && 'p-3',
		padding === 'md' && 'p-4',
		padding === 'lg' && 'p-6',
		
		// Interactive styles
		interactive && [
			'cursor-pointer select-none',
			'hover:scale-[1.02] hover:shadow-[var(--shadow-component-xl)]',
			'active:scale-[0.98]',
			focusRing(),
			'text-left' // Reset button text alignment
		],
		
		className
	);

	if (interactive) {
		return (
			<button
				className={baseClasses}
				onClick={onClick}
				aria-label={ariaLabel}
				{...props}
			>
				{children}
			</button>
		);
	}

	return (
		<div
			ref={ref}
			className={baseClasses}
			onClick={onClick}
			aria-label={ariaLabel}
			{...props}
		>
			{children}
		</div>
	);
});

Card.displayName = 'Card';

// Card sub-components for better composition
export const CardHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
	<div className={cn('mb-4 pb-4 border-b border-[var(--color-border-secondary)]', className)}>
		{children}
	</div>
);

export const CardTitle = ({ children, className }: { children: ReactNode; className?: string }) => (
	<h3 className={cn('text-xl font-semibold text-[var(--color-text-primary)]', className)}>
		{children}
	</h3>
);

export const CardDescription = ({ children, className }: { children: ReactNode; className?: string }) => (
	<p className={cn('text-[var(--color-text-secondary)] mt-2', className)}>
		{children}
	</p>
);

export const CardContent = ({ children, className }: { children: ReactNode; className?: string }) => (
	<div className={cn('', className)}>
		{children}
	</div>
);

export const CardFooter = ({ children, className }: { children: ReactNode; className?: string }) => (
	<div className={cn('mt-4 pt-4 border-t border-[var(--color-border-secondary)] flex items-center justify-between', className)}>
		{children}
	</div>
);

export default Card;

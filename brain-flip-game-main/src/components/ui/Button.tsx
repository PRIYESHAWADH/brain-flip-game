"use client";
import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
	size?: 'sm' | 'md' | 'lg' | 'xl';
	loading?: boolean;
	neon?: boolean;
}

const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-5 h-5',
		lg: 'w-6 h-6'
	};

	return (
		<svg
			className={clsx('animate-spin', sizeClasses[size])}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	);
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ 
		className, 
		variant = 'primary', 
		size = 'md',
		loading = false,
		neon = false,
		disabled = false,
		children,
		...props 
	}, ref) => {
		const isDisabled = disabled || loading;

		return (
			<button
				ref={ref}
				{...props}
				disabled={isDisabled}
				aria-disabled={isDisabled}
				className={clsx(
					// Base styles using design tokens
					'inline-flex items-center justify-center gap-2',
					'font-medium rounded-lg',
					'transition-all duration-300 ease-out transform',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
					'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
					'select-none touch-manipulation active:scale-95',
					neon && 'shadow-lg hover:shadow-xl',
					
					// Size variants with consistent heights
					size === 'sm' && [
						'px-3 py-2 text-sm h-8',
						'min-w-[5rem]'
					],
					size === 'md' && [
						'px-4 py-2.5 text-base h-10',
						'min-w-[6rem]'
					],
					size === 'lg' && [
						'px-6 py-3 text-lg h-12',
						'min-w-[7rem]'
					],
					size === 'xl' && [
						'px-8 py-4 text-xl h-14',
						'min-w-[8rem]'
					],
					
					// Variant styles with enhanced neon effects
					variant === 'primary' && [
						'bg-neon-green text-dark-bg font-bold',
						'border border-neon-green/30',
						!isDisabled && [
							'hover:bg-neon-green/90 hover:border-neon-green',
							'hover:shadow-[0_0_20px_rgba(0,255,65,0.5)]',
							neon && 'hover:shadow-[0_0_30px_rgba(0,255,65,0.7)]'
						],
						'focus-visible:ring-neon-green'
					],
					variant === 'secondary' && [
						'bg-electric-blue text-dark-bg font-bold',
						'border border-electric-blue/30',
						!isDisabled && [
							'hover:bg-electric-blue/90 hover:border-electric-blue',
							'hover:shadow-[0_0_20px_rgba(65,145,255,0.5)]',
							neon && 'hover:shadow-[0_0_30px_rgba(65,145,255,0.7)]'
						],
						'focus-visible:ring-electric-blue'
					],
					variant === 'ghost' && [
						'text-electric-blue bg-transparent',
						'border border-electric-blue/20',
						!isDisabled && [
							'hover:bg-electric-blue/10 hover:border-electric-blue/50',
							'hover:shadow-[0_0_15px_rgba(65,145,255,0.3)]',
							neon && 'hover:shadow-[0_0_25px_rgba(65,145,255,0.5)]'
						],
						'focus-visible:ring-electric-blue'
					],
					variant === 'danger' && [
						'bg-warning-red text-dark-bg font-bold',
						'border border-warning-red/30',
						!isDisabled && [
							'hover:bg-warning-red/90 hover:border-warning-red',
							'hover:shadow-[0_0_20px_rgba(255,65,65,0.5)]',
							neon && 'hover:shadow-[0_0_30px_rgba(255,65,65,0.7)]'
						],
						'focus-visible:ring-warning-red'
					],
					variant === 'success' && [
						'bg-neon-green text-dark-bg font-bold',
						'border border-neon-green/30',
						!isDisabled && [
							'hover:bg-neon-green/90 hover:border-neon-green',
							'hover:shadow-[0_0_20px_rgba(0,255,65,0.5)]',
							neon && 'hover:shadow-[0_0_30px_rgba(0,255,65,0.7)]'
						],
						'focus-visible:ring-neon-green'
					],
					
					// Neon effect
					neon && 'animate-neon-pulse',
					
					className
				)}
				disabled={isDisabled}
				aria-busy={loading}
				{...props}
			>
				{loading && (
					<LoadingSpinner size={size === 'sm' ? 'sm' : size === 'xl' ? 'lg' : 'md'} />
				)}
				<span className={clsx(loading && 'opacity-70')}>
					{children}
				</span>
			</button>
		);
	}
);

Button.displayName = 'Button';
export default Button;

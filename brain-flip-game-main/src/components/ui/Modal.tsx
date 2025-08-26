import { ReactNode, useEffect, useRef } from 'react';
import { cn, glassEffect, focusRing } from '@/utils/cn';
import { X } from 'lucide-react';

export interface ModalProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
	closeOnBackdrop?: boolean;
	closeOnEscape?: boolean;
	showCloseButton?: boolean;
	className?: string;
	'aria-labelledby'?: string;
	'aria-describedby'?: string;
}

export default function Modal({
	open,
	onClose,
	children,
	size = 'md',
	closeOnBackdrop = true,
	closeOnEscape = true,
	showCloseButton = true,
	className,
	'aria-labelledby': ariaLabelledBy,
	'aria-describedby': ariaDescribedBy,
}: ModalProps) {

	// Focus management
	useEffect(() => {
		if (open) {
			// Store the previously focused element
			previousFocusRef.current = document.activeElement as HTMLElement;
			
			// Focus the modal
			setTimeout(() => {
				modalRef.current?.focus();
			}, 0);
		} else {
			// Restore focus to the previously focused element
			previousFocusRef.current?.focus();
		}
	}, [open]);

	// Escape key handler
	useEffect(() => {
		if (!open || !closeOnEscape) return;
			if (event.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [open, closeOnEscape, onClose]);

	// Focus trap
	useEffect(() => {
		if (!open) return;
			if (event.key !== 'Tab') return;
			if (!modal) return;
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);

			if (event.shiftKey) {
				if (document.activeElement === firstElement) {
					lastElement?.focus();
					event.preventDefault();
				}
			} else {
				if (document.activeElement === lastElement) {
					firstElement?.focus();
					event.preventDefault();
				}
			}
		};

		document.addEventListener('keydown', handleTabKey);
		return () => document.removeEventListener('keydown', handleTabKey);
	}, [open]);

	// Prevent body scroll when modal is open
	useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}

		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	if (!open) return null;
		if (event.target === event.currentTarget && closeOnBackdrop) {
			onClose();
		}
	};

	return (
		<div
			className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
			style={{ backgroundColor: 'var(--color-background-overlay)' }}
			onClick={handleBackdropClick}
			role="dialog"
			aria-modal="true"
			aria-labelledby={ariaLabelledBy}
			aria-describedby={ariaDescribedBy}
		>
			<div
				ref={modalRef}
				className={cn(
					// Base styles
					'relative rounded-xl shadow-[var(--shadow-component-xl)]',
					'transform transition-all duration-300',
					'animate-in fade-in-0 zoom-in-95',
					glassEffect('strong'),
					focusRing(),
					
					// Size variants
					size === 'sm' && 'max-w-sm w-full',
					size === 'md' && 'max-w-md w-full',
					size === 'lg' && 'max-w-lg w-full',
					size === 'xl' && 'max-w-xl w-full',
					size === 'full' && 'max-w-[95vw] max-h-[95vh] w-full h-full',
					
					// Responsive adjustments
					'max-h-[90vh] overflow-y-auto',
					
					className
				)}
				tabIndex={-1}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close button */}
				{showCloseButton && (
					<button
						className={cn(
							'absolute top-4 right-4 z-10',
							'p-2 rounded-lg',
							'text-[var(--color-text-secondary)]',
							'hover:text-[var(--color-text-primary)]',
							'hover:bg-[var(--color-surface-hover)]',
							'transition-colors duration-200',
							focusRing()
						)}
						onClick={onClose}
						aria-label="Close modal"
					>
						<X size={20} />
					</button>
				)}

				{/* Modal content */}
				<div className="p-6">
					{children}
				</div>
			</div>
		</div>
	);
}

// Modal sub-components for better composition
export const ModalHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
	<div className={cn('mb-6 pb-4 border-b border-[var(--color-border-secondary)]', className)}>
		{children}
	</div>
);

export const ModalTitle = ({ children, className, id }: { children: ReactNode; className?: string; id?: string }) => (
	<h2 id={id} className={cn('text-2xl font-semibold text-[var(--color-text-primary)]', className)}>
		{children}
	</h2>
);

export const ModalDescription = ({ children, className, id }: { children: ReactNode; className?: string; id?: string }) => (
	<p id={id} className={cn('text-[var(--color-text-secondary)] mt-2', className)}>
		{children}
	</p>
);

export const ModalContent = ({ children, className }: { children: ReactNode; className?: string }) => (
	<div className={cn('mb-6', className)}>
		{children}
	</div>
);

export const ModalFooter = ({ children, className }: { children: ReactNode; className?: string }) => (
	<div className={cn('flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border-secondary)]', className)}>
		{children}
	</div>
);

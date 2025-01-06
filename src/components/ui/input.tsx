import { ComponentProps, forwardRef } from 'react';

import { cn } from '@/lib/utils';

const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(({ className, type, ...props }, ref) => {
	return (
		<input
			type={type}
			className={cn(
				'bg-background',
				'border-input',
				'border',
				'disabled:cursor-not-allowed',
				'disabled:opacity-50',
				'file:bg-transparent',
				'file:border-0',
				'file:font-medium',
				'file:text-foreground',
				'flex',
				'focus-visible:outline-none',
				'focus-visible:ring-2',
				'focus-visible:ring-offset-2',
				'focus-visible:ring-ring',
				'h-10',
				'placeholder:text-muted-foreground',
				'px-3',
				'py-2',
				'ring-offset-background',
				'rounded-md',
				'text-base',
				'w-full',
				className,
			)}
			ref={ref}
			{...props}
		/>
	);
});
Input.displayName = 'Input';

export { Input };

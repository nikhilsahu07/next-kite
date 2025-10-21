'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-black text-white dark:bg-white dark:text-black border-black/10 dark:border-white/20 hover:bg-black/90 dark:hover:bg-white/90',
        ghost:
          'bg-transparent text-black dark:text-white border border-black/10 dark:border-white/20 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]',
        outline:
          'bg-white dark:bg-black text-black dark:text-white border border-black/20 dark:border-white/20 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]',
      },
      size: {
        default: 'h-9 px-3',
        sm: 'h-8 px-2 text-xs',
        lg: 'h-10 px-4 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

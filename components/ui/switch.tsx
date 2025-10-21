'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onChange, className, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        onClick={() => onChange?.(!checked)}
        ref={ref}
        className={cn(
          'relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full border border-black/20 dark:border-white/20 transition-colors',
          checked ? 'bg-black dark:bg-white' : 'bg-transparent',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'absolute left-0.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border border-black/20 dark:border-white/20 bg-white dark:bg-black transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    );
  }
);
Switch.displayName = 'Switch';

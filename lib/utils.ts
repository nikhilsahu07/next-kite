import { twMerge } from 'tailwind-merge';

// Utility to merge Tailwind classes with sensible precedence
export function cn(
  ...classNames: Array<string | false | null | undefined>
): string {
  return twMerge(
    classNames
      .filter((value) => typeof value === 'string' && value.length > 0)
      .join(' ')
  );
}

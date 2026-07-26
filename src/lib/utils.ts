import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge conditional class names and resolve conflicting Tailwind utilities
// (later wins), e.g. cn('bg-surface', 'bg-accent/10') -> 'bg-accent/10'.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

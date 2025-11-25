import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines clsx and tailwind-merge for optimal class name handling
 * - clsx: Conditional class joining
 * - twMerge: Resolves Tailwind conflicts (e.g., 'px-2 px-4' → 'px-4')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

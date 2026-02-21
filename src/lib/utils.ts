import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names with proper conflict resolution.
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F59E0B', // Amber
  Transportation: '#3B82F6', // Blue
  Entertainment: '#8B5CF6', // Violet
  Shopping: '#EC4899', // Pink
  Bills: '#EF4444', // Red
  Other: '#6B7280', // Gray
};

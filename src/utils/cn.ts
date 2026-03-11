import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getSynergyColorClass = (contribution: number): string => {
  if (contribution > 0.3) return 'text-green-600';
  if (contribution > 0) return 'text-green-500';
  if (contribution < -0.3) return 'text-red-600';
  if (contribution < 0) return 'text-red-500';
  return 'text-muted-foreground';
};

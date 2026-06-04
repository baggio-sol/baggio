import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTimeUntil(targetDate: Date): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Tier accent colors (1 = elite favorite … 5 = longshot). Mirrors CLAUDE.md.
export const TIER_COLORS: Record<number, string> = {
  1: '#60a5fa',
  2: '#818cf8',
  3: '#a78bfa',
  4: '#f472b6',
  5: '#b91c1c',
};

export function tierColor(tier: number): string {
  return TIER_COLORS[tier] ?? '#6f6796';
}

const TIER_LABELS: Record<number, string> = {
  1: 'Elite favorite',
  2: 'Contender',
  3: 'Solid side',
  4: 'Outsider',
  5: 'Longshot',
};

export function tierLabel(tier: number): string {
  return TIER_LABELS[tier] ?? '';
}

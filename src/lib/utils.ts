import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = 'PLN', locale = 'pl-PL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)} kg`;
  return `${grams} g`;
}

export function getStorageZoneColor(zone?: string): string {
  switch (zone) {
    case 'FROZEN': return 'var(--color-frozen)';
    case 'CHILLED': return 'var(--color-chilled)';
    case 'AMBIENT': return 'var(--color-ambient)';
    default: return 'var(--color-muted-foreground)';
  }
}

export function getStorageZoneIcon(zone?: string): string {
  switch (zone) {
    case 'FROZEN': return '\u2744\ufe0f';
    case 'CHILLED': return '\u2603\ufe0f';
    case 'AMBIENT': return '\ud83c\udf3e';
    default: return '\ud83d\udce6';
  }
}

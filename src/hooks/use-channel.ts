'use client';

import { useSalonStore } from '@/stores/salon-store';

export function useChannel(): string {
  const salonSlug = useSalonStore((s) => s.salonSlug);
  return process.env.NEXT_PUBLIC_CHANNEL || salonSlug || 'default';
}

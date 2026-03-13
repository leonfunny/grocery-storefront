'use client';

import { useEffect } from 'react';
import { useSalonStore } from '@/stores/salon-store';

export function SalonLoader() {
  const fetchSalon = useSalonStore((s) => s.fetchSalon);

  useEffect(() => {
    fetchSalon();
  }, [fetchSalon]);

  return null;
}

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Salon } from '@/types';

interface SalonState {
  salon: Salon | null;
  salonSlug: string | null;
  isLoading: boolean;
  setSalon: (salon: Salon) => void;
  setSalonSlug: (slug: string) => void;
  fetchSalon: () => Promise<void>;
}

export const useSalonStore = create<SalonState>()(
  persist(
    (set, get) => ({
      salon: null,
      salonSlug: process.env.NEXT_PUBLIC_SALON_SLUG || null,
      isLoading: false,
      setSalon: (salon) => set({ salon, salonSlug: salon.slug }),
      setSalonSlug: (slug) => set({ salonSlug: slug }),
      fetchSalon: async () => {
        const slug = get().salonSlug || process.env.NEXT_PUBLIC_SALON_SLUG;
        if (!slug || get().salon) return;

        set({ isLoading: true });
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
          const res = await fetch(`${baseUrl}/public/salon/${slug}`);
          if (res.ok) {
            const salon = await res.json();
            set({ salon, salonSlug: salon.slug, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'grocery-salon',
    }
  )
);

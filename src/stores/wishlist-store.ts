'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAuthToken } from '@/lib/auth';
import {
  WISHLIST_PRODUCT_FIELDS,
  WISHLIST_QUERY,
  WISHLIST_SYNC_MUTATION,
} from '@/lib/graphql/operations/grocery';
import { getGraphqlErrorMessage, graphqlRequest } from '@/lib/graphql/request';
import { useSalonStore } from '@/stores/salon-store';
import type { WishlistItem, WishlistServerItem } from '@/types';

interface WishlistState {
  items: WishlistItem[];
  guestItems: WishlistItem[];
  source: 'guest' | 'server';
  serverStatus: 'unknown' | 'available' | 'unavailable';
  isLoading: boolean;
  initialized: boolean;
  loadWishlist: () => Promise<void>;
  syncGuestWishlist: (items?: WishlistItem[]) => Promise<boolean>;
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => Promise<boolean>;
  hasItem: (productId: string) => boolean;
  clear: () => Promise<void>;
  resetLocal: () => void;
}

interface WishlistQueryResponse {
  wishlist: {
    items: WishlistServerItem[] | null;
  } | null;
}

interface WishlistSyncResponse {
  wishlistSync: {
    success: boolean;
    message: string | null;
    items: WishlistServerItem[] | null;
  } | null;
}

type WishlistSetter = (partial: Partial<WishlistState>) => void;

function setGuestWishlistState(
  set: WishlistSetter,
  items: WishlistItem[],
  serverStatus: WishlistState['serverStatus'] = 'unknown'
) {
  set({
    items,
    guestItems: items,
    source: 'guest',
    serverStatus,
    initialized: true,
    isLoading: false,
  });
}

function isWishlistAuthUnavailable(message: string | null | undefined): boolean {
  const value = message?.toLowerCase() ?? '';
  return value.includes('auth') || value.includes('unauthorized') || value.includes('authentication required');
}

function getCurrentChannel(): string {
  return process.env.NEXT_PUBLIC_CHANNEL
    || useSalonStore.getState().salonSlug
    || process.env.NEXT_PUBLIC_SALON_SLUG
    || 'default';
}

function upsertWishlistItem(
  items: WishlistItem[],
  item: Omit<WishlistItem, 'addedAt'>
): WishlistItem[] {
  const existing = items.find((entry) => entry.productId === item.productId);

  if (existing) {
    return items.map((entry) =>
      entry.productId === item.productId
        ? { ...entry, ...item, addedAt: existing.addedAt }
        : entry
    );
  }

  return [...items, { ...item, addedAt: new Date().toISOString() }];
}

function removeWishlistItem(items: WishlistItem[], productId: string): WishlistItem[] {
  return items.filter((item) => item.productId !== productId);
}

function buildWishlistProductsQuery(productIds: string[]) {
  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));

  if (uniqueIds.length === 0) {
    return {
      query: '',
      variables: {},
    };
  }

  const variableDefinitions = uniqueIds
    .map((_, index) => `$id${index}: ID!`)
    .join(', ');

  const selections = uniqueIds
    .map(
      (_, index) => `
        product${index}: product(channel: $channel, id: $id${index}) {
          ...WishlistProductFields
        }
      `
    )
    .join('\n');

  const variables: Record<string, unknown> = { channel: getCurrentChannel() };
  uniqueIds.forEach((id, index) => {
    variables[`id${index}`] = id;
  });

  return {
    query: `
      ${WISHLIST_PRODUCT_FIELDS}
      query WishlistProducts($channel: String!, ${variableDefinitions}) {
        ${selections}
      }
    `,
    variables,
  };
}

async function fetchWishlistProducts(productIds: string[]) {
  const { query, variables } = buildWishlistProductsQuery(productIds);

  if (!query) {
    return {} as Record<string, any>;
  }

  const response = await graphqlRequest<Record<string, any>>(query, variables);
  const message = getGraphqlErrorMessage(response.errors);
  if (message) {
    throw new Error(message);
  }

  return Object.values(response.data ?? {}).reduce<Record<string, any>>((acc, product: any) => {
    if (product?.id) {
      acc[product.id] = product;
    }

    return acc;
  }, {});
}

async function hydrateWishlistItems(
  serverItems: WishlistServerItem[],
  cachedItems: WishlistItem[]
): Promise<WishlistItem[]> {
  if (serverItems.length === 0) return [];

  const productMap = await fetchWishlistProducts(serverItems.map((item) => item.productId));
  const fallbackCurrency = useSalonStore.getState().salon?.currency ?? 'PLN';

  return serverItems.map((serverItem) => {
    const product = productMap[serverItem.productId];
    const cachedItem = cachedItems.find((item) => item.productId === serverItem.productId);
    const variant = product?.variants?.find((entry: any) => entry.id === serverItem.variantId)
      ?? product?.variants?.[0];

    const price = variant?.pricing?.price?.gross?.amount
      ?? product?.pricing?.priceRange?.start?.gross?.amount
      ?? cachedItem?.price
      ?? serverItem.price
      ?? 0;

    const currency = variant?.pricing?.price?.gross?.currency
      ?? product?.pricing?.priceRange?.start?.gross?.currency
      ?? cachedItem?.currency
      ?? fallbackCurrency;

    return {
      productId: serverItem.productId,
      variantId: variant?.id ?? serverItem.variantId ?? cachedItem?.variantId ?? '',
      slug: product?.slug ?? cachedItem?.slug,
      name: product?.name ?? cachedItem?.name ?? serverItem.name ?? 'Saved item',
      thumbnail: product?.thumbnail?.url ?? cachedItem?.thumbnail,
      price,
      currency,
      quantity: cachedItem?.quantity ?? 1,
      storageZone: product?.storageZone ?? cachedItem?.storageZone,
      addedAt: serverItem.addedAt ?? cachedItem?.addedAt ?? new Date().toISOString(),
    };
  });
}

async function syncServerWishlist(nextGuestItems: WishlistItem[], set: WishlistSetter): Promise<boolean> {
  const productIds = Array.from(new Set(nextGuestItems.map((item) => item.productId).filter(Boolean)));
  const response = await graphqlRequest<WishlistSyncResponse>(WISHLIST_SYNC_MUTATION, { productIds });
  const topLevelMessage = getGraphqlErrorMessage(response.errors);
  const payload = response.data?.wishlistSync;
  const message = topLevelMessage ?? payload?.message ?? null;

  if (isWishlistAuthUnavailable(message)) {
    setGuestWishlistState(set, nextGuestItems, 'unavailable');
    return true;
  }

  if (topLevelMessage || !payload) {
    throw new Error(message ?? 'Wishlist sync failed');
  }

  if (!payload.success) {
    if (isWishlistAuthUnavailable(payload.message)) {
      setGuestWishlistState(set, nextGuestItems, 'unavailable');
      return true;
    }

    throw new Error(payload.message ?? 'Wishlist sync failed');
  }

  if (!payload.items) {
    setGuestWishlistState(set, nextGuestItems, 'unavailable');
    return true;
  }

  try {
    const hydratedItems = await hydrateWishlistItems(payload.items, nextGuestItems);
    set({
      items: hydratedItems,
      guestItems: hydratedItems,
      source: 'server',
      serverStatus: 'available',
      initialized: true,
      isLoading: false,
    });
  } catch {
    setGuestWishlistState(set, nextGuestItems, 'unavailable');
  }

  return true;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      guestItems: [],
      source: 'guest',
      serverStatus: 'unknown',
      isLoading: false,
      initialized: false,

      loadWishlist: async () => {
        const token = getAuthToken();

        if (!token) {
          setGuestWishlistState(set, get().guestItems);
          return;
        }

        if (get().serverStatus === 'unavailable') {
          setGuestWishlistState(set, get().guestItems, 'unavailable');
          return;
        }

        set({ isLoading: true, initialized: true });

        try {
          const response = await graphqlRequest<WishlistQueryResponse>(WISHLIST_QUERY, undefined, { token });
          const message = getGraphqlErrorMessage(response.errors);

          if (isWishlistAuthUnavailable(message)) {
            setGuestWishlistState(set, get().guestItems, 'unavailable');
            return;
          }

          if (message) {
            throw new Error(message);
          }

          const serverItems = response.data?.wishlist?.items;

          if (serverItems == null) {
            setGuestWishlistState(set, get().guestItems, 'unavailable');
            return;
          }

          const hydratedItems = await hydrateWishlistItems(serverItems, get().guestItems);

          set({
            items: hydratedItems,
            guestItems: hydratedItems,
            source: 'server',
            serverStatus: 'available',
            isLoading: false,
            initialized: true,
          });
        } catch {
          setGuestWishlistState(set, get().guestItems, 'unavailable');
        }
      },

      syncGuestWishlist: async (items) => {
        const nextGuestItems = items ?? get().guestItems;
        const token = getAuthToken();

        if (!token) {
          setGuestWishlistState(set, nextGuestItems);
          return true;
        }

        if (get().serverStatus === 'unavailable') {
          setGuestWishlistState(set, nextGuestItems, 'unavailable');
          return true;
        }

        set({
          items: nextGuestItems,
          guestItems: nextGuestItems,
          source: 'guest',
          isLoading: true,
          initialized: true,
        });

        try {
          return await syncServerWishlist(nextGuestItems, set);
        } catch {
          setGuestWishlistState(set, nextGuestItems, 'unavailable');
          return true;
        }
      },

      addItem: async (item) => {
        const previousSource = get().source;
        const nextGuestItems = upsertWishlistItem(get().guestItems, item);
        const hasToken = Boolean(getAuthToken());
        const canUseServer = hasToken && get().serverStatus !== 'unavailable';

        set({
          items: nextGuestItems,
          guestItems: nextGuestItems,
          source: canUseServer && previousSource === 'server' ? 'server' : 'guest',
          initialized: true,
        });

        if (!canUseServer) {
          return true;
        }

        try {
          return await syncServerWishlist(nextGuestItems, set);
        } catch {
          setGuestWishlistState(set, nextGuestItems, 'unavailable');
          return true;
        }
      },

      removeItem: async (productId) => {
        const previousSource = get().source;
        const nextGuestItems = removeWishlistItem(get().guestItems, productId);
        const hasToken = Boolean(getAuthToken());
        const canUseServer = hasToken && get().serverStatus !== 'unavailable';

        set({
          items: removeWishlistItem(get().items, productId),
          guestItems: nextGuestItems,
          source: canUseServer && previousSource === 'server' ? 'server' : 'guest',
          initialized: true,
        });

        if (!canUseServer) {
          return true;
        }

        try {
          return await syncServerWishlist(nextGuestItems, set);
        } catch {
          setGuestWishlistState(set, nextGuestItems, 'unavailable');
          return true;
        }
      },

      toggleItem: async (item) => {
        if (get().hasItem(item.productId)) {
          return get().removeItem(item.productId);
        }

        return get().addItem(item);
      },

      hasItem: (productId) => get().items.some((item) => item.productId === productId),

      clear: async () => {
        const hasToken = Boolean(getAuthToken());
        const canUseServer = hasToken && get().serverStatus !== 'unavailable';
        const emptyItems: WishlistItem[] = [];
        const previousSource = get().source;

        set({
          items: emptyItems,
          guestItems: emptyItems,
          source: canUseServer && previousSource === 'server' ? previousSource : 'guest',
          initialized: true,
        });

        if (!canUseServer) return;

        try {
          await syncServerWishlist(emptyItems, set);
        } catch {
          setGuestWishlistState(set, get().guestItems, 'unavailable');
        }
      },

      resetLocal: () => {
        setGuestWishlistState(set, []);
      },
    }),
    {
      name: 'grocery-wishlist',
      partialize: (state) => ({ guestItems: state.guestItems }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<WishlistState> & { items?: WishlistItem[] } | undefined;
        const guestItems = persisted?.guestItems ?? persisted?.items ?? [];

        return {
          ...currentState,
          guestItems,
          items: guestItems,
          source: 'guest',
          serverStatus: 'unknown',
          initialized: false,
          isLoading: false,
        };
      },
    }
  )
);

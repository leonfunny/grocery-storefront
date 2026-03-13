'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useClient } from 'urql';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { PRODUCTS_QUERY } from '@/lib/graphql/operations/grocery';
import { ProductCard } from '@/components/product/ProductCard';
import { AllergenFilter } from '@/components/grocery/AllergenFilter';
import { SortDropdown, SORT_OPTIONS } from '@/components/grocery/SortDropdown';
import { useChannel } from '@/hooks/use-channel';
import type { StorageZone } from '@/types';

const PAGE_SIZE = 24;

const DIETARY_OPTIONS = ['vegan', 'vegetarian', 'gluten-free', 'lactose-free', 'sugar-free'];
const CERT_OPTIONS = ['organic', 'halal', 'kosher'];
const ZONE_OPTIONS: StorageZone[] = ['FROZEN', 'CHILLED', 'AMBIENT'];

function ProductSkeleton() {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      <div className="aspect-square skeleton" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-4 skeleton rounded w-1/2" />
        <div className="flex justify-between items-end mt-3">
          <div className="h-5 skeleton rounded w-16" />
          <div className="w-9 h-9 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const t = useTranslations('products');
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialZone = searchParams.get('zone') as StorageZone | null;
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  const [excludeAllergens, setExcludeAllergens] = useState<string[]>([]);
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [storageZone, setStorageZone] = useState<StorageZone | ''>(initialZone || '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);
  const [loadedProducts, setLoadedProducts] = useState<any[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const channel = useChannel();

  // Sync search param from URL changes
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  const sortOption = SORT_OPTIONS.find((o) => o.value === sort) || SORT_OPTIONS[0];

  const filter = useMemo(() => {
    const f: Record<string, any> = {};
    if (excludeAllergens.length > 0) f.excludeAllergens = excludeAllergens;
    if (dietaryTags.length > 0) f.dietaryTags = dietaryTags;
    if (certifications.length > 0) f.certifications = certifications;
    if (storageZone) f.storageZone = storageZone;
    if (search.trim()) f.search = search.trim();
    return f;
  }, [excludeAllergens, dietaryTags, certifications, storageZone, search]);

  const [result] = useQuery({
    query: PRODUCTS_QUERY,
    variables: {
      channel,
      first: PAGE_SIZE,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      sortBy: { field: sortOption.field, direction: sortOption.direction },
    },
  });

  // Update loaded products when initial query changes
  useEffect(() => {
    if (result.data?.products) {
      const products = result.data.products.edges?.map((e: any) => e.node) || [];
      setLoadedProducts(products);
      setEndCursor(result.data.products.pageInfo?.endCursor || null);
      setHasMore(result.data.products.pageInfo?.hasNextPage || false);
    }
  }, [result.data]);

  const totalCount = result.data?.products?.totalCount ?? 0;
  const activeFilterCount = excludeAllergens.length + dietaryTags.length + certifications.length + (storageZone ? 1 : 0);

  function updateUrl(newSort: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort !== 'newest') {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }

  function handleSortChange(newSort: string) {
    setSort(newSort);
    setLoadedProducts([]);
    updateUrl(newSort);
  }

  const client = useClient();

  async function handleLoadMore() {
    if (!endCursor || loadingMore) return;
    setLoadingMore(true);

    const result2 = await client.query(PRODUCTS_QUERY, {
      channel,
      first: PAGE_SIZE,
      after: endCursor,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      sortBy: { field: sortOption.field, direction: sortOption.direction },
    }).toPromise();

    if (result2.data?.products) {
      const newProducts = result2.data.products.edges?.map((e: any) => e.node) || [];
      setLoadedProducts((prev) => [...prev, ...newProducts]);
      setEndCursor(result2.data.products.pageInfo?.endCursor || null);
      setHasMore(result2.data.products.pageInfo?.hasNextPage || false);
    }
    setLoadingMore(false);
  }

  function clearAll() {
    setExcludeAllergens([]);
    setDietaryTags([]);
    setCertifications([]);
    setStorageZone('');
    setSearch('');
  }

  return (
    <div className="container-grocery py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="heading-display text-2xl md:text-3xl" style={{ color: 'var(--color-foreground)' }}>
          {t('title')}
          {totalCount > 0 && (
            <span className="text-base font-normal ml-2 tabular-nums" style={{ color: 'var(--color-muted-foreground)' }}>
              ({totalCount})
            </span>
          )}
        </h1>
        <div className="flex items-center gap-2">
          <SortDropdown value={sort} onChange={handleSortChange} />
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors duration-fast hover-surface"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            aria-expanded={filtersOpen}
            aria-controls="filter-panel"
            aria-label={`${t('filters')}${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            {t('filters')}
            {activeFilterCount > 0 && (
              <span
                className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--color-primary)' }}
                aria-hidden="true"
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <label htmlFor="product-search" className="sr-only">Search products</label>
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: 'var(--color-muted-foreground)' }}
          aria-hidden="true"
        />
        <input
          id="product-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder') || 'Search products...'}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-transparent transition-colors duration-fast focus:outline-none focus-visible:ring-2"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-foreground)',
            ['--tw-ring-color' as string]: 'var(--color-ring)',
          }}
        />
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div
          id="filter-panel"
          className="rounded-xl border p-5 mb-6 space-y-5 animate-fade-up"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
          role="region"
          aria-label="Product filters"
        >
          <AllergenFilter selected={excludeAllergens} onChange={setExcludeAllergens} />

          <fieldset>
            <legend className="text-sm font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>{t('dietaryFilter')}</legend>
            <div className="flex flex-wrap gap-2" role="group">
              {DIETARY_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setDietaryTags((prev) => prev.includes(tag) ? prev.filter((d) => d !== tag) : [...prev, tag])}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-fast"
                  style={{
                    borderColor: dietaryTags.includes(tag) ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: dietaryTags.includes(tag) ? 'var(--color-accent)' : 'transparent',
                    color: dietaryTags.includes(tag) ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                  }}
                  aria-pressed={dietaryTags.includes(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>{t('zoneFilter')}</legend>
            <div className="flex gap-2" role="group">
              {ZONE_OPTIONS.map((zone) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setStorageZone((prev) => prev === zone ? '' : zone)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium text-white transition-opacity duration-fast ${storageZone === zone ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
                  style={{ backgroundColor: `var(--color-${zone.toLowerCase()})` }}
                  aria-pressed={storageZone === zone}
                >
                  {zone}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>{t('certFilter')}</legend>
            <div className="flex flex-wrap gap-2" role="group">
              {CERT_OPTIONS.map((cert) => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => setCertifications((prev) => prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert])}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-fast"
                  style={{
                    borderColor: certifications.includes(cert) ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: certifications.includes(cert) ? 'var(--color-accent)' : 'transparent',
                    color: certifications.includes(cert) ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                  }}
                  aria-pressed={certifications.includes(cert)}
                >
                  {cert}
                </button>
              ))}
            </div>
          </fieldset>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity duration-fast hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              {t('clearFilters')}
            </button>
          )}
        </div>
      )}

      {/* Products grid */}
      {result.fetching && loadedProducts.length === 0 ? (
        <div className="product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : loadedProducts.length > 0 ? (
        <>
          <div className="product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loadedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-medium transition-colors duration-fast hover-surface disabled:opacity-60"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
              >
                {loadingMore ? t('loading') || 'Loading...' : `${t('loadMore')} (${loadedProducts.length} / ${totalCount})`}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            No products match your filters.
          </p>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-3 text-sm font-medium transition-opacity duration-fast hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              {t('clearFilters')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useQuery, useClient, type CombinedError } from 'urql';
import { SlidersHorizontal, X } from 'lucide-react';
import { PRODUCTS_QUERY } from '@/lib/graphql/operations/grocery';
import { ProductCard } from '@/components/product/ProductCard';
import { AllergenFilter } from '@/components/grocery/AllergenFilter';
import { SortDropdown, SORT_OPTIONS } from '@/components/grocery/SortDropdown';
import { useRouter } from '@/i18n/navigation';
import { useChannel } from '@/hooks/use-channel';
import type { StorageZone } from '@/types';

const PAGE_SIZE = 24;

const DIETARY_OPTIONS = ['vegan', 'vegetarian', 'gluten-free', 'lactose-free', 'sugar-free'];
const CERT_OPTIONS = ['organic', 'halal', 'kosher'];
const ZONE_OPTIONS: StorageZone[] = ['FROZEN', 'CHILLED', 'AMBIENT'];

function getProductsErrorMessage(error: CombinedError | undefined | null, fallbackMessage: string) {
  if (!error) return null;

  const graphQlMessage = error.graphQLErrors.find((entry) => entry.message?.trim())?.message;
  if (graphQlMessage) return graphQlMessage;

  if (error.networkError?.message?.trim()) return error.networkError.message;
  if (error.message?.trim()) return error.message;

  return fallbackMessage;
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-none border-0 sm:rounded-xl sm:border" style={{ borderColor: 'var(--color-border)' }}>
      <div className="aspect-square skeleton" />
      <div className="space-y-2 p-3.5 sm:bg-[var(--color-card)]">
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
  const tCommon = useTranslations('common');
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
  }, [searchParams, search]);

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

  const [result, reexecuteProductsQuery] = useQuery({
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
  const productsErrorMessage = getProductsErrorMessage(result.error, tCommon('error'));
  const hasProductsError = Boolean(productsErrorMessage) && loadedProducts.length === 0;
  const filterContent = (
    <>
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
    </>
  );

  function buildProductsUrl(nextSort: string, nextSearch: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmedSearch = nextSearch.trim();

    if (nextSort !== 'newest') {
      params.set('sort', nextSort);
    } else {
      params.delete('sort');
    }

    if (trimmedSearch) {
      params.set('search', trimmedSearch);
    } else {
      params.delete('search');
    }

    const nextParams = params.toString();
    return `/products${nextParams ? `?${nextParams}` : ''}`;
  }

  function handleSortChange(newSort: string) {
    setSort(newSort);
    setLoadedProducts([]);
    router.replace(buildProductsUrl(newSort, search), { scroll: false });
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
    router.replace(buildProductsUrl(sort, ''), { scroll: false });
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
        <div className="hidden md:flex items-center gap-2">
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

      <div className="mb-6 flex items-center gap-2 md:hidden">
        <div className="flex-1">
          <SortDropdown value={sort} onChange={handleSortChange} />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors duration-fast hover-surface"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
          aria-expanded={filtersOpen}
          aria-controls="mobile-filter-sheet"
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

      {/* Filters panel */}
      {filtersOpen && (
        <>
          <div
            id="filter-panel"
            className="hidden md:block rounded-xl border p-5 mb-6 space-y-5 animate-fade-up"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
            role="region"
            aria-label="Product filters"
          >
            {filterContent}
          </div>

          <div className="fixed inset-0 z-[70] md:hidden" data-testid="mobile-filter-sheet" role="dialog" aria-modal="true" aria-label={t('filters')}>
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              aria-label={`${tCommon('close')} ${t('filters').toLowerCase()}`}
              onClick={() => setFiltersOpen(false)}
            />
            <div
              className="absolute inset-x-0 bottom-0 rounded-t-[1.75rem] border px-4 pt-4 pb-6 animate-slide-up"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-card)',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)',
              }}
            >
              <div className="flex items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-muted-foreground)' }}>
                    {t('filters')}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-foreground)' }}>
                    {activeFilterCount > 0 ? `${activeFilterCount} active` : t('clearFilters')}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover-surface"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                  aria-label={`${tCommon('close')} ${t('filters').toLowerCase()}`}
                  onClick={() => setFiltersOpen(false)}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                  {tCommon('close')}
                </button>
              </div>

              <div className="mt-5 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
                {filterContent}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Products grid */}
      {result.fetching && loadedProducts.length === 0 && !hasProductsError ? (
        <div className="product-grid grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : hasProductsError ? (
        <div
          className="rounded-2xl border px-5 py-10 text-center"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
            {tCommon('error')}
          </p>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {productsErrorMessage}
          </p>
          <button
            type="button"
            onClick={() => reexecuteProductsQuery({ requestPolicy: 'network-only' })}
            className="mt-4 inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors duration-fast hover-surface"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
          >
            {tCommon('retry')}
          </button>
        </div>
      ) : loadedProducts.length > 0 ? (
        <>
          <div className="product-grid grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {loadedProducts.map((product: any, index: number) => (
              <ProductCard key={product.id} product={product} imagePriority={index < 4} />
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
                {loadingMore ? tCommon('loading') : `${t('loadMore')} (${loadedProducts.length} / ${totalCount})`}
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

'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useQuery } from 'urql';
import { Snowflake, Thermometer, Sun, ChevronRight, Leaf, Percent } from 'lucide-react';
import { PRODUCTS_QUERY, RECIPES_QUERY } from '@/lib/graphql/operations/grocery';
import { ProductCard } from '@/components/product/ProductCard';
import { RecipeCard } from '@/components/grocery/RecipeCard';
import { PromoBanner } from '@/components/grocery/PromoBanner';
import { useChannel } from '@/hooks/use-channel';

const ZONE_CARDS = [
  { zone: 'FROZEN', icon: Snowflake, colorVar: 'var(--color-frozen)' },
  { zone: 'CHILLED', icon: Thermometer, colorVar: 'var(--color-chilled)' },
  { zone: 'AMBIENT', icon: Sun, colorVar: 'var(--color-ambient)' },
] as const;

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

function RecipeSkeleton() {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-full" />
        <div className="flex gap-3 mt-3">
          <div className="h-3 skeleton rounded w-12" />
          <div className="h-3 skeleton rounded w-8" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const t = useTranslations('home');
  const tNav = useTranslations('nav');
  const channel = useChannel();

  const [productsResult] = useQuery({
    query: PRODUCTS_QUERY,
    variables: { channel, first: 8 },
  });

  const [recipesResult] = useQuery({
    query: RECIPES_QUERY,
    variables: { channel, first: 4 },
  });

  const products = productsResult.data?.products?.edges?.map((e: any) => e.node) || [];
  const recipes = recipesResult.data?.recipes?.edges?.map((e: any) => e.node) || [];

  // Filter products with discounts for "On Sale" section
  const saleProducts = products.filter((p: any) => {
    return p.pricing?.onSale === true || (p.pricing?.priceRangeUndiscounted?.start?.gross?.amount > p.pricing?.priceRange?.start?.gross?.amount);
  }).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="py-20 md:py-32" style={{ backgroundColor: 'var(--color-accent)' }}>
        <div className="container-grocery text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Leaf className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
          </div>
          <h1
            className="heading-display text-4xl md:text-5xl lg:text-6xl mb-5"
            style={{ color: 'var(--color-foreground)' }}
          >
            {t('hero')}
          </h1>
          <p
            className="text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {t('heroSub')}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-fast active:scale-95 hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {tNav('products')}
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container-grocery py-8 md:py-12">
        <PromoBanner />
      </section>

      {/* Shop by zone */}
      <section className="container-grocery py-16 md:py-20">
        <h2
          className="heading-section text-xl md:text-2xl mb-8"
          style={{ color: 'var(--color-foreground)' }}
        >
          {t('shopByZone')}
        </h2>
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          {ZONE_CARDS.map(({ zone, icon: Icon, colorVar }) => (
            <Link
              key={zone}
              href={`/products?zone=${zone}`}
              className="flex flex-col items-center gap-3 p-6 md:p-8 rounded-xl border card-hover"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
              aria-label={`Shop ${zone.toLowerCase()} products`}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-normal group-hover:scale-110"
                style={{ backgroundColor: `color-mix(in srgb, ${colorVar} 15%, transparent)` }}
              >
                <Icon className="w-7 h-7" style={{ color: colorVar }} aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                {t(zone.toLowerCase() as 'frozen' | 'chilled' | 'ambient')}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* On Sale */}
      {saleProducts.length > 0 && (
        <section className="container-grocery py-16 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5" style={{ color: 'var(--color-last-chance)' }} aria-hidden="true" />
              <h2 className="heading-section text-xl md:text-2xl" style={{ color: 'var(--color-foreground)' }}>
                {t('onSale')}
              </h2>
            </div>
            <Link
              href="/products?sort=price_asc"
              className="text-sm font-medium flex items-center gap-1 transition-colors duration-fast hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              {t('seeAllDeals')}
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {saleProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* New arrivals */}
      <section className="container-grocery py-16 md:py-20">
        <div className="flex items-center justify-between mb-8">
          <h2
            className="heading-section text-xl md:text-2xl"
            style={{ color: 'var(--color-foreground)' }}
          >
            {t('newArrivals')}
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium flex items-center gap-1 transition-colors duration-fast hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}
            aria-label="View all products"
          >
            {t('seeAllRecipes').replace('recipes', 'products')}
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        {productsResult.fetching ? (
          <div className="product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              No products available yet.
            </p>
          </div>
        )}
      </section>

      {/* Featured recipes */}
      {(recipesResult.fetching || recipes.length > 0) && (
        <section
          className="py-16 md:py-20"
          style={{ backgroundColor: 'var(--color-muted)' }}
        >
          <div className="container-grocery">
            <div className="flex items-center justify-between mb-8">
              <h2
                className="heading-section text-xl md:text-2xl"
                style={{ color: 'var(--color-foreground)' }}
              >
                {t('featuredRecipes')}
              </h2>
              <Link
                href="/recipes"
                className="text-sm font-medium flex items-center gap-1 transition-colors duration-fast hover:opacity-80"
                style={{ color: 'var(--color-primary)' }}
                aria-label="View all recipes"
              >
                {t('seeAllRecipes')}
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            {recipesResult.fetching ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <RecipeSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {recipes.map((recipe: any) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

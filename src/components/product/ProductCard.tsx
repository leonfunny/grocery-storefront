'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ShoppingCart, Info, Package, Check } from 'lucide-react';
import { toast } from 'sonner';
import { FreshnessBadge } from '@/components/grocery/FreshnessBadge';
import { NutritionModal } from '@/components/grocery/NutritionModal';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import type { GroceryProduct } from '@/types';

interface ProductCardProps {
  product: GroceryProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations();
  const addItem = useCartStore((s) => s.addItem);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const variant = product.variants?.[0];
  const inStock = (variant?.stockQuantity ?? product.stockQuantity) > 0;
  const price = variant?.price ?? product.price;
  const currency = variant?.currency ?? product.currency ?? 'PLN';

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!variant || !inStock) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      thumbnail: product.thumbnail?.url,
      price,
      currency,
      quantity: 1,
      storageZone: product.storageZone,
      allergens: product.allergens,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    toast.success(t('product.addToCartSuccess'));
  }

  function handleNutritionClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setNutritionOpen(true);
  }

  return (
    <>
      <Link
        href={`/products/${product.slug}`}
        className="group block rounded-xl border overflow-hidden card-hover"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
        aria-label={`${product.name}, ${formatPrice(price, currency)}${!inStock ? `, ${t('product.outOfStock')}` : ''}`}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: 'var(--color-muted)' }}>
          {product.thumbnail?.url ? (
            <Image
              src={product.thumbnail.url}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-slow"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="w-10 h-10 opacity-20" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
            </div>
          )}

          {/* Freshness badge */}
          {product.freshness && (
            <div className="absolute top-2.5 left-2.5">
              <FreshnessBadge freshness={product.freshness} nearestExpiry={product.nearestExpiry} compact />
            </div>
          )}

          {/* Storage zone indicator */}
          {product.storageZone && (
            <span
              className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-white zone-${product.storageZone.toLowerCase()}`}
              aria-label={`Storage: ${product.storageZone.toLowerCase()}`}
            >
              {product.storageZone === 'FROZEN' ? '\u2744' : product.storageZone === 'CHILLED' ? '\u2603' : '\u2600'}
            </span>
          )}

          {/* Nutrition info button — 44x44 touch target */}
          {product.nutritionFacts && (
            <button
              type="button"
              onClick={handleNutritionClick}
              className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-fast hover:scale-110"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-card) 90%, transparent)', borderColor: 'var(--color-border)' }}
              aria-label={`${t('product.nutrition')} — ${product.name}`}
            >
              <Info className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            </button>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-card) 70%, transparent)' }}>
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>
                {t('product.outOfStock')}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5">
          {/* Allergen chips */}
          {product.allergens && product.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2" role="list" aria-label={t('product.allergens')}>
              {product.allergens.slice(0, 3).map((a) => (
                <span key={a} className="allergen-chip text-[10px]" role="listitem">{t(`allergens.${a}` as any)}</span>
              ))}
              {product.allergens.length > 3 && (
                <span className="allergen-chip text-[10px]" role="listitem">+{product.allergens.length - 3}</span>
              )}
            </div>
          )}

          {/* Dietary tags */}
          {product.dietaryTags && product.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-foreground)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-sm font-semibold line-clamp-2 mb-1.5 leading-snug" style={{ color: 'var(--color-foreground)' }}>
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-end justify-between mt-2.5 gap-2">
            <div>
              <span className="text-base font-bold tabular-nums tracking-tight" style={{ color: 'var(--color-foreground)' }}>
                {formatPrice(price, currency)}
              </span>
              {product.sellByWeight && product.pricePerUnit && product.unitOfMeasure && (
                <span className="block text-[10px] mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                  {formatPrice(product.pricePerUnit, currency)}/{product.unitOfMeasure}
                </span>
              )}
              {product.compareAtPrice && product.compareAtPrice > price && (
                <span className="text-xs line-through ml-1.5" style={{ color: 'var(--color-muted-foreground)' }}>
                  {formatPrice(product.compareAtPrice, currency)}
                </span>
              )}
            </div>

            {/* Add to cart — 36x36 visual, 44x44 touch */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-fast disabled:opacity-40 active:scale-95"
              style={{
                backgroundColor: justAdded ? 'var(--color-fresh)' : inStock ? 'var(--color-primary)' : 'var(--color-muted)',
                color: inStock ? 'white' : 'var(--color-muted-foreground)',
              }}
              aria-label={inStock ? t('common.addToCart') : t('product.outOfStock')}
            >
              {justAdded ? (
                <Check className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </Link>

      {/* Nutrition modal */}
      <NutritionModal
        open={nutritionOpen}
        onOpenChange={setNutritionOpen}
        productName={product.name}
        nutritionFacts={product.nutritionFacts}
        ingredients={product.ingredients}
        allergens={product.allergens}
        dietaryTags={product.dietaryTags}
        certifications={product.certifications}
        countryOfOrigin={product.countryOfOrigin}
      />
    </>
  );
}

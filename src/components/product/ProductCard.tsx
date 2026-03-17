'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ShoppingCart, Info, Package, Check, Minus, Plus, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { FreshnessBadge } from '@/components/grocery/FreshnessBadge';
import { NutritionModal } from '@/components/grocery/NutritionModal';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { formatPrice, getImageSrc, isImageProxySrc } from '@/lib/utils';
import type { GroceryProduct } from '@/types';

interface ProductCardProps {
  product: GroceryProduct;
  imagePriority?: boolean;
}

export function ProductCard({ product, imagePriority = false }: ProductCardProps) {
  const t = useTranslations();
  const addItem = useCartStore((s) => s.addItem);
  const addWishlistItem = useWishlistStore((s) => s.addItem);
  const removeWishlistItem = useWishlistStore((s) => s.removeItem);
  const isWishlisted = useWishlistStore((s) => s.items.some((item) => item.productId === product.id));
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const variant = product.variants?.[0] as any;
  const inStock = (variant?.quantityAvailable ?? (product as any)?.quantityAvailable ?? 0) > 0;
  const price = variant?.pricing?.price?.gross?.amount ?? (product as any).pricing?.priceRange?.start?.gross?.amount ?? 0;
  const currency = variant?.pricing?.price?.gross?.currency ?? (product as any).pricing?.priceRange?.start?.gross?.currency ?? 'PLN';
  const imageUrl = getImageSrc(product.thumbnail?.url);
  const maxQuantity = Math.max(1, variant?.quantityAvailable ?? (product as any)?.quantityAvailable ?? 99);
  const quantityUnitLabel = t('product.quantityUnitShort');
  const addToCartLabel = t('common.addToCart');

  function updateQuantity(e: React.MouseEvent, delta: number) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;

    setQuantity((current) => Math.max(1, Math.min(maxQuantity, current + delta)));
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!variant || !inStock) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      thumbnail: imageUrl || undefined,
      price,
      currency,
      quantity,
      storageZone: product.storageZone,
      allergens: product.allergens,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    toast.success(t('product.addToCartSuccess'));
  }

  function handleWishlistToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!variant) return;

    void (async () => {
      if (isWishlisted) {
        const success = await removeWishlistItem(product.id);
        if (success) {
          toast.success(t('wishlist.removeSuccess'));
        } else {
          toast.error(t('common.error'));
        }
        return;
      }

      const success = await addWishlistItem({
        productId: product.id,
        variantId: variant.id,
        slug: product.slug,
        name: product.name,
        thumbnail: imageUrl || undefined,
        price,
        currency,
        quantity,
        storageZone: product.storageZone,
      });

      if (success) {
        toast.success(t('wishlist.addSuccess'));
      } else {
        toast.error(t('common.error'));
      }
    })();
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
        <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: 'var(--color-muted)' }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              priority={imagePriority}
              className="object-cover group-hover:scale-105 transition-transform duration-slow"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized={isImageProxySrc(imageUrl)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="w-10 h-10 opacity-20" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
            </div>
          )}

          {product.freshness && (
            <div className="absolute top-2.5 left-2.5">
              <FreshnessBadge freshness={product.freshness} nearestExpiry={product.nearestExpiry} compact />
            </div>
          )}

          <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={handleWishlistToggle}
              className="w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-fast hover:scale-105"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-card) 90%, transparent)',
                borderColor: isWishlisted ? 'var(--color-primary)' : 'var(--color-border)',
                color: isWishlisted ? 'var(--color-primary)' : 'var(--color-foreground)',
              }}
              aria-label={isWishlisted ? t('wishlist.remove') : t('wishlist.add')}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} aria-hidden="true" />
            </button>

            {product.storageZone && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white zone-${product.storageZone.toLowerCase()}`}
                aria-label={t('product.storageAria', { zone: t(`cart.zoneGroup.${product.storageZone}` as any) })}
              >
                {product.storageZone === 'FROZEN' ? '\u2744' : product.storageZone === 'CHILLED' ? '\u2603' : '\u2600'}
              </span>
            )}
          </div>

          {product.nutritionFacts && (
            <button
              type="button"
              onClick={handleNutritionClick}
              className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-fast hover:scale-110"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-card) 90%, transparent)', borderColor: 'var(--color-border)' }}
              aria-label={`${t('product.nutrition')} - ${product.name}`}
            >
              <Info className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            </button>
          )}

          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-card) 70%, transparent)' }}>
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>
                {t('product.outOfStock')}
              </span>
            </div>
          )}
        </div>

        <div className="p-3.5">
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

          <div className="mt-2.5">
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

            <div className="grid grid-cols-[92px,minmax(0,1fr)] gap-2 mt-3 items-start">
              <div className="group/quantity">
                <div
                  className="grid grid-cols-3 h-11 rounded-xl border overflow-hidden"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                >
                  <button
                    type="button"
                    onClick={(e) => updateQuantity(e, -1)}
                    disabled={!inStock || quantity <= 1}
                    className="flex items-center justify-center transition-all duration-fast hover-surface disabled:opacity-40"
                    aria-label={t('product.decreaseQuantity', { name: product.name })}
                  >
                    <Minus className="w-4 h-4 opacity-80 transition-opacity duration-fast group-hover/quantity:opacity-100" aria-hidden="true" />
                  </button>
                  <span
                    className="flex items-center justify-center text-sm font-semibold tabular-nums"
                    style={{ color: 'var(--color-foreground)' }}
                    aria-live="polite"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => updateQuantity(e, 1)}
                    disabled={!inStock || quantity >= maxQuantity}
                    className="flex items-center justify-center transition-all duration-fast hover-surface disabled:opacity-40"
                    aria-label={t('product.increaseQuantity', { name: product.name })}
                  >
                    <Plus className="w-4 h-4 opacity-80 transition-opacity duration-fast group-hover/quantity:opacity-100" aria-hidden="true" />
                  </button>
                </div>
                <span
                  className="block text-center text-[11px] mt-1 transition-all duration-fast opacity-0 translate-y-1 group-hover/quantity:opacity-100 group-hover/quantity:translate-y-0 group-focus-within/quantity:opacity-100 group-focus-within/quantity:translate-y-0"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  {quantityUnitLabel}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="h-11 rounded-xl px-3 checkout-btn flex items-center justify-center gap-2 font-semibold transition-all duration-fast disabled:opacity-40 active:scale-[0.98]"
                style={{
                  backgroundColor: justAdded ? 'var(--color-fresh)' : inStock ? 'var(--color-primary)' : 'var(--color-muted)',
                  color: inStock ? 'white' : 'var(--color-muted-foreground)',
                }}
                aria-label={inStock ? t('product.addToCartWithQuantity', { quantity }) : t('product.outOfStock')}
              >
                {justAdded ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                )}
                <span className="truncate text-xs sm:text-sm">{addToCartLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </Link>

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

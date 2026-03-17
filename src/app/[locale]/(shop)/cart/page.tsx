'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ShoppingCart, Trash2, Minus, Plus, Package, ArrowRight, Truck, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { StorageZoneGroup } from '@/components/grocery/StorageZoneGroup';
import { Link } from '@/i18n/navigation';
import { useHydrated } from '@/hooks/use-hydrated';
import { formatPrice, getImageSrc, isImageProxySrc } from '@/lib/utils';
import type { CartItem } from '@/types';

export default function CartPage() {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const tWishlist = useTranslations('wishlist');
  const isHydrated = useHydrated();
  const initialized = useCartStore((state) => state.initialized);
  const itemCount = useCartStore((state) => state.getItemCount());
  const { items, removeItem, updateQuantity, getSubtotal, getItemsByZone } = useCartStore();
  const addWishlistItem = useWishlistStore((state) => state.addItem);

  const displayItems = isHydrated && initialized ? items : [];
  const subtotal = isHydrated && initialized ? getSubtotal() : 0;
  const currency = displayItems[0]?.currency ?? 'PLN';
  const itemsByZone = isHydrated && initialized ? getItemsByZone() : {};
  const hasZones = Object.keys(itemsByZone).length > 1 || !itemsByZone['OTHER'];

  async function handleSaveForLater(item: CartItem) {
    const success = await addWishlistItem({
      productId: item.productId,
      variantId: item.variantId,
      slug: item.slug,
      name: item.name,
      thumbnail: item.thumbnail,
      price: item.price,
      currency: item.currency,
      quantity: item.quantity,
      storageZone: item.storageZone,
    });
    if (!success) {
      toast.error(tCommon('error'));
      return;
    }

    removeItem(item.id);
    toast.success(tWishlist('savedForLater'));
  }

  function renderCartItem(item: CartItem) {
    const imageUrl = getImageSrc(item.thumbnail);

    return (
      <div key={item.id} className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: 'var(--color-card)' }}>
        {/* Thumbnail */}
        <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-muted)' }}>
          {imageUrl ? (
            <Image src={imageUrl} alt="" width={56} height={56} className="object-cover w-full h-full" unoptimized={isImageProxySrc(imageUrl)} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="w-5 h-5 opacity-30" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Name + allergens */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
            {item.name}
          </p>
          {item.allergens && item.allergens.length > 0 && (
            <div className="flex gap-1 mt-0.5">
              {item.allergens.slice(0, 2).map((a) => (
                <span key={a} className="allergen-chip text-[10px]">{a}</span>
              ))}
            </div>
          )}
          <p className="text-sm tabular-nums mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
            {formatPrice(item.price, item.currency)}
          </p>
          <button
            type="button"
            onClick={() => void handleSaveForLater(item)}
            className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium transition-opacity duration-fast hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}
          >
            <Heart className="w-3.5 h-3.5" aria-hidden="true" />
            {tWishlist('saveForLater')}
          </button>
        </div>

        {/* Quantity — 44px touch targets */}
        <div className="flex items-center gap-0.5 border rounded-lg" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-11 h-11 flex items-center justify-center transition-colors duration-fast hover-surface"
            aria-label={`Decrease ${item.name} quantity`}
          >
            <Minus className="w-4 h-4" style={{ color: 'var(--color-foreground)' }} aria-hidden="true" />
          </button>
          <span className="px-2 text-sm font-medium tabular-nums min-w-[40px] text-center" style={{ color: 'var(--color-foreground)' }} aria-live="polite">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-11 h-11 flex items-center justify-center transition-colors duration-fast hover-surface"
            aria-label={`Increase ${item.name} quantity`}
          >
            <Plus className="w-4 h-4" style={{ color: 'var(--color-foreground)' }} aria-hidden="true" />
          </button>
        </div>

        {/* Line total */}
        <span className="text-sm font-bold tabular-nums w-20 text-right" style={{ color: 'var(--color-foreground)' }}>
          {formatPrice(item.totalPrice ?? item.price * item.quantity, item.currency)}
        </span>

        {/* Remove — 44px touch target */}
        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="w-11 h-11 flex items-center justify-center rounded-lg transition-colors duration-fast hover-surface"
          aria-label={`${t('remove')} ${item.name}`}
        >
          <Trash2 className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (!isHydrated || !initialized) {
    return (
      <div className="container-grocery py-16 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
        <h1 className="heading-display text-xl mb-2" style={{ color: 'var(--color-foreground)' }}>{tCommon('loading')}</h1>
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className="container-grocery py-16 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
        <h1 className="heading-display text-xl mb-2" style={{ color: 'var(--color-foreground)' }}>{t('empty')}</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-muted-foreground)' }}>{t('emptyDesc')}</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-fast active:scale-95"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {t('shopNow')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-grocery py-8 md:py-12">
      <h1 className="heading-display text-2xl md:text-3xl mb-6" style={{ color: 'var(--color-foreground)' }}>
        {t('title')}
        <span className="text-base font-normal ml-2 tabular-nums" style={{ color: 'var(--color-muted-foreground)' }}>
          ({isHydrated && initialized ? itemCount : 0})
        </span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items grouped by storage zone */}
        <div className="lg:col-span-2">
          {hasZones ? (
            <StorageZoneGroup itemsByZone={itemsByZone} renderItem={renderCartItem} />
          ) : (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {displayItems.map(renderCartItem)}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="sticky top-20 rounded-xl border p-5" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
            <h2 className="heading-section text-lg mb-4" style={{ color: 'var(--color-foreground)' }}>
              {t('title')}
            </h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-muted-foreground)' }}>{t('subtotal')}</span>
                <span className="font-medium tabular-nums" style={{ color: 'var(--color-foreground)' }}>
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-muted-foreground)' }}>{t('shipping')}</span>
                <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="border-t pt-3 mb-5 flex justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <span className="font-bold" style={{ color: 'var(--color-foreground)' }}>{t('total')}</span>
              <span className="font-bold text-lg tabular-nums" style={{ color: 'var(--color-foreground)' }}>
                {formatPrice(subtotal, currency)}
              </span>
            </div>

            {/* Free shipping progress */}
            {(() => {
              const threshold = 150;
              const progress = Math.min(subtotal / threshold, 1);
              const remaining = Math.max(threshold - subtotal, 0);
              return (
                <div className="mb-5">
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-muted)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-normal"
                      style={{
                        width: `${progress * 100}%`,
                        backgroundColor: progress >= 1 ? 'var(--color-fresh)' : 'var(--color-primary)',
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: progress >= 1 ? 'var(--color-fresh)' : 'var(--color-muted-foreground)' }}>
                    <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                    {progress >= 1
                      ? (t('freeShippingReached') || 'You qualify for free shipping!')
                      : (t('freeShippingRemaining', { amount: formatPrice(remaining, currency) }) || `Add ${formatPrice(remaining, currency)} more for free shipping`)}
                  </p>
                </div>
              );
            })()}

            <Link
              href="/checkout"
              className="checkout-btn flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white transition-all duration-fast active:scale-[0.98]"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {t('checkout')}
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

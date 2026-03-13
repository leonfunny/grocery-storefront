'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Minus, Plus, Package, ArrowRight, Truck } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { StorageZoneGroup } from '@/components/grocery/StorageZoneGroup';
import { formatPrice } from '@/lib/utils';
import type { CartItem } from '@/types';

export default function CartPage() {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const { items, removeItem, updateQuantity, getSubtotal, getItemsByZone } = useCartStore();

  const subtotal = getSubtotal();
  const itemsByZone = getItemsByZone();
  const hasZones = Object.keys(itemsByZone).length > 1 || !itemsByZone['OTHER'];

  function renderCartItem(item: CartItem) {
    return (
      <div key={item.variantId} className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: 'var(--color-card)' }}>
        {/* Thumbnail */}
        <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-muted)' }}>
          {item.thumbnail ? (
            <Image src={item.thumbnail} alt="" width={56} height={56} className="object-cover w-full h-full" />
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
        </div>

        {/* Quantity — 44px touch targets */}
        <div className="flex items-center gap-0.5 border rounded-lg" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
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
            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
            className="w-11 h-11 flex items-center justify-center transition-colors duration-fast hover-surface"
            aria-label={`Increase ${item.name} quantity`}
          >
            <Plus className="w-4 h-4" style={{ color: 'var(--color-foreground)' }} aria-hidden="true" />
          </button>
        </div>

        {/* Line total */}
        <span className="text-sm font-bold tabular-nums w-20 text-right" style={{ color: 'var(--color-foreground)' }}>
          {formatPrice(item.price * item.quantity, item.currency)}
        </span>

        {/* Remove — 44px touch target */}
        <button
          type="button"
          onClick={() => removeItem(item.variantId)}
          className="w-11 h-11 flex items-center justify-center rounded-lg transition-colors duration-fast hover-surface"
          aria-label={`${t('remove')} ${item.name}`}
        >
          <Trash2 className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (items.length === 0) {
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
          ({items.length})
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
                {items.map(renderCartItem)}
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
                  {formatPrice(subtotal)}
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
                {formatPrice(subtotal)}
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
                      : (t('freeShippingRemaining', { amount: formatPrice(remaining) }) || `Add ${formatPrice(remaining)} more for free shipping`)}
                  </p>
                </div>
              );
            })()}

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white transition-all duration-fast active:scale-[0.98]"
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

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingCart, Search, Menu, X, Leaf, Heart } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete';
import { MiniCart } from './MiniCart';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const t = useTranslations('nav');
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  function handleSearch(query: string) {
    const q = query.trim();
    if (!q) return;
    router.push(`/products?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchValue('');
  }

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        height: 'var(--header-height)',
        borderColor: 'var(--color-border)',
        backgroundColor: 'color-mix(in srgb, var(--color-background) 92%, transparent)',
      }}
      role="banner"
    >
      <div className="container-grocery h-full flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Grocery Store Home">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-fast group-hover:scale-105"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold hidden sm:block tracking-tight" style={{ color: 'var(--color-foreground)' }}>
            Grocery
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {[
            { href: '/', label: t('home') },
            { href: '/products', label: t('products') },
            { href: '/recipes', label: t('recipes') },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 text-sm font-medium rounded-lg hover-surface"
              style={{ color: 'var(--color-foreground)' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex flex-1 max-w-md">
          <SearchAutocomplete
            inputId="desktop-search"
            value={searchValue}
            onValueChange={setSearchValue}
            onSearch={handleSearch}
            placeholder={t('searchPlaceholder')}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="md:hidden p-2.5 rounded-xl hover-surface"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
            aria-expanded={searchOpen}
          >
            {searchOpen ? (
              <X className="w-5 h-5" style={{ color: 'var(--color-foreground)' }} />
            ) : (
              <Search className="w-5 h-5" style={{ color: 'var(--color-foreground)' }} />
            )}
          </button>

          <ThemeToggle />
          <LanguageSwitcher />

          <Link
            href="/wishlist"
            className="relative p-2.5 rounded-xl hover-surface"
            aria-label={`${t('wishlist')}${isMounted && wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}
          >
            <Heart className="w-5 h-5" style={{ color: 'var(--color-foreground)' }} />
            {isMounted && wishlistCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
                aria-hidden="true"
              >
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </Link>

          <MiniCart />

          <Link
            href="/cart"
            className="relative p-2.5 rounded-xl hover-surface md:hidden"
            aria-label={`${t('cart')}${isMounted && itemCount > 0 ? `, ${itemCount} items` : ''}`}
          >
            <ShoppingCart className="w-5 h-5" style={{ color: 'var(--color-foreground)' }} />
            {isMounted && itemCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
                aria-hidden="true"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="md:hidden p-2.5 rounded-xl hover-surface"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? (
              <X className="w-5 h-5" style={{ color: 'var(--color-foreground)' }} />
            ) : (
              <Menu className="w-5 h-5" style={{ color: 'var(--color-foreground)' }} />
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div
          className="md:hidden border-t px-4 py-3 animate-fade-up"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
        >
          <SearchAutocomplete
            inputId="mobile-search"
            value={searchValue}
            onValueChange={setSearchValue}
            onSearch={handleSearch}
            placeholder={t('searchPlaceholder')}
            autoFocus
            className="w-full"
            onDismiss={() => setSearchOpen(false)}
          />
        </div>
      )}

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="md:hidden border-t animate-fade-up"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
          aria-label="Mobile navigation"
        >
          {[
            { href: '/', label: t('home') },
            { href: '/products', label: t('products') },
            { href: '/recipes', label: t('recipes') },
            { href: '/wishlist', label: `${t('wishlist')}${isMounted && wishlistCount > 0 ? ` (${wishlistCount})` : ''}` },
            { href: '/cart', label: `${t('cart')}${isMounted && itemCount > 0 ? ` (${itemCount})` : ''}` },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block px-4 py-3.5 text-sm font-medium border-b hover-surface"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

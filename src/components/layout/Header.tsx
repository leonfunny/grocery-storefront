'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShoppingCart, Search, Menu, X, Leaf } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';

export function Header() {
  const t = useTranslations('nav');
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const itemCount = useCartStore((s) => s.getItemCount());

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = searchValue.trim();
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
        {/* Logo */}
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

        {/* Desktop Nav */}
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

        {/* Search bar (desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <label htmlFor="desktop-search" className="sr-only">{t('searchPlaceholder')}</label>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
            <input
              id="desktop-search"
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-transparent transition-colors duration-fast focus:outline-none focus-visible:ring-2"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Mobile search toggle */}
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

          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2.5 rounded-xl hover-surface"
            aria-label={`${t('cart')}${itemCount > 0 ? `, ${itemCount} items` : ''}`}
          >
            <ShoppingCart className="w-5 h-5" style={{ color: 'var(--color-foreground)' }} />
            {itemCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
                aria-hidden="true"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
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

      {/* Mobile search */}
      {searchOpen && (
        <form
          onSubmit={handleSearch}
          className="md:hidden border-t px-4 py-3 animate-fade-up"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
        >
          <label htmlFor="mobile-search" className="sr-only">{t('searchPlaceholder')}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
            <input
              id="mobile-search"
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t('searchPlaceholder')}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-transparent focus:outline-none focus-visible:ring-2"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            />
          </div>
        </form>
      )}

      {/* Mobile menu */}
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
            { href: '/cart', label: `${t('cart')}${itemCount > 0 ? ` (${itemCount})` : ''}` },
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

'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingCart, Search, Menu, X, Leaf, Heart, LogIn, LogOut, UserRound, ChevronDown, Package, MapPin, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete';
import { MiniCart } from './MiniCart';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const locale = useLocale();
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  function handleSearch(query: string) {
    const q = query.trim();
    if (!q) return;
    router.push(`/products?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchValue('');
  }

  const isAuthenticated = isMounted && session.status === 'authenticated';
  const accountName = session.user?.fullName?.split(' ')[0] || t('account');
  const accountMenuLabels = locale === 'pl'
    ? {
        greeting: 'Witaj',
        account: 'Moje konto',
        orders: 'Moje zamówienia',
        addresses: 'Adresy',
        security: 'Bezpieczeństwo',
      }
    : {
        greeting: 'Hello',
        account: 'My account',
        orders: 'Orders',
        addresses: 'Addresses',
        security: 'Security',
      };
  const accountMenuItems = [
    { href: '/account#profile', label: accountMenuLabels.account, icon: UserRound },
    { href: '/account#orders', label: accountMenuLabels.orders, icon: Package },
    { href: '/account#addresses', label: accountMenuLabels.addresses, icon: MapPin },
    { href: '/account#security', label: accountMenuLabels.security, icon: Shield },
    { href: '/wishlist', label: t('wishlist'), icon: Heart },
    { href: '/cart', label: t('cart'), icon: ShoppingCart },
  ];

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    toast.success(tAuth('logoutSuccess'));
    router.push('/');
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

          {isAuthenticated ? (
            <div className="relative hidden md:block ml-1 group/account">
              <button
                type="button"
                className="h-10 max-w-[160px] rounded-xl px-3 flex items-center gap-2 border transition-colors duration-fast hover-surface"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                title={session.user?.fullName || t('account')}
                aria-haspopup="menu"
              >
                <UserRound className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium truncate">{accountName}</span>
                <ChevronDown className="w-4 h-4 shrink-0 opacity-70 transition-transform duration-fast group-hover/account:rotate-180 group-focus-within/account:rotate-180" aria-hidden="true" />
              </button>

              <div className="absolute right-0 top-full pt-2 w-[280px] opacity-0 invisible translate-y-2 transition-all duration-fast group-hover/account:opacity-100 group-hover/account:visible group-hover/account:translate-y-0 group-focus-within/account:opacity-100 group-focus-within/account:visible group-focus-within/account:translate-y-0">
                <div
                  className="rounded-2xl border p-3 shadow-lg"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'color-mix(in srgb, var(--color-card) 96%, white)',
                  }}
                >
                  <div className="px-2 pt-1 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--color-muted-foreground)' }}>
                      {accountMenuLabels.greeting}
                    </p>
                    <p className="mt-1 text-sm font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>
                      {session.user?.fullName || t('account')}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>
                      {session.user?.email}
                    </p>
                  </div>

                  <div className="py-2">
                    {accountMenuItems.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-fast hover-surface"
                        style={{ color: 'var(--color-foreground)' }}
                      >
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{label}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-fast hover-surface"
                      style={{ color: 'var(--color-foreground)' }}
                    >
                      <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex h-10 px-3 rounded-xl border items-center gap-2 text-sm font-medium hover-surface ml-1"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>{t('login')}</span>
            </Link>
          )}

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
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="md:hidden p-2.5 rounded-xl hover-surface"
              aria-label={t('logout')}
            >
              <LogOut className="w-5 h-5" style={{ color: 'var(--color-foreground)' }} />
            </button>
          ) : (
            <Link
              href="/login"
              className="md:hidden p-2.5 rounded-xl hover-surface"
              aria-label={t('login')}
            >
              <LogIn className="w-5 h-5" style={{ color: 'var(--color-foreground)' }} />
            </Link>
          )}

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
          {isAuthenticated ? (
            <>
              <div
                className="px-4 py-3.5 text-sm font-medium border-b flex items-center gap-2"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
              >
                <UserRound className="w-4 h-4" aria-hidden="true" />
                <span>{session.user?.fullName || t('account')}</span>
              </div>
              <Link
                href="/account"
                className="block px-4 py-3.5 text-sm font-medium border-b hover-surface"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                onClick={() => setMenuOpen(false)}
              >
                {accountMenuLabels.account}
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="w-full text-left px-4 py-3.5 text-sm font-medium border-b hover-surface flex items-center gap-2"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>{t('logout')}</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block px-4 py-3.5 text-sm font-medium border-b hover-surface"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                onClick={() => setMenuOpen(false)}
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                className="block px-4 py-3.5 text-sm font-medium border-b hover-surface"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                onClick={() => setMenuOpen(false)}
              >
                {t('register')}
              </Link>
            </>
          )}
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

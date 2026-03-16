'use client';

import { useLocale, useTranslations } from 'next-intl';
import { UserRound, Package, MapPin, Shield, Heart, ShoppingCart, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';

export default function AccountPage() {
  const locale = useLocale();
  const tNav = useTranslations('nav');
  const session = useAuthStore((state) => state.session);
  const isAuthenticated = session.status === 'authenticated';
  const labels = locale === 'pl'
    ? {
        title: 'Moje konto',
        subtitle: 'Zarz\u0105dzaj ustawieniami konta i szybkim dost\u0119pem do zakup\u00f3w.',
        loginTitle: 'Zaloguj si\u0119, aby przej\u015b\u0107 do konta',
        loginDescription: 'Panel konta jest dost\u0119pny tylko dla zalogowanych klient\u00f3w.',
        loginAction: 'Przejd\u017a do logowania',
        status: 'Wkr\u00f3tce',
        profileTitle: 'Edycja profilu',
        profileDescription: 'Dane osobowe, preferencje i podstawowe ustawienia konta.',
        ordersTitle: 'Twoje zam\u00f3wienia',
        ordersDescription: 'Historia zam\u00f3wie\u0144 i statusy b\u0119d\u0105 widoczne po pod\u0142\u0105czeniu CRM.',
        addressesTitle: 'Adresy dostawy',
        addressesDescription: 'Zapisane adresy i domy\u015blne dane dostawy.',
        securityTitle: 'Bezpiecze\u0144stwo',
        securityDescription: 'Zmiana has\u0142a i ustawienia bezpiecze\u0144stwa logowania.',
        shortcutsTitle: 'Skróty',
        shortcutsDescription: 'Najcz\u0119\u015bciej u\u017cywane miejsca po zalogowaniu.',
      }
    : {
        title: 'My account',
        subtitle: 'Manage your account settings and quick shopping access.',
        loginTitle: 'Sign in to access your account',
        loginDescription: 'The account hub is only available to authenticated customers.',
        loginAction: 'Go to login',
        status: 'Coming soon',
        profileTitle: 'Profile',
        profileDescription: 'Personal details, preferences, and basic account settings.',
        ordersTitle: 'Orders',
        ordersDescription: 'Order history and statuses will appear once the CRM endpoints are wired in.',
        addressesTitle: 'Addresses',
        addressesDescription: 'Saved delivery addresses and default checkout details.',
        securityTitle: 'Security',
        securityDescription: 'Password changes and login security settings.',
        shortcutsTitle: 'Shortcuts',
        shortcutsDescription: 'The pages you are most likely to need right after sign-in.',
      };

  if (!isAuthenticated) {
    return (
      <div className="container-grocery py-12 md:py-16">
        <div
          className="mx-auto max-w-2xl rounded-[28px] border p-8 text-center"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
        >
          <UserRound className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          <h1 className="heading-display text-2xl md:text-3xl" style={{ color: 'var(--color-foreground)' }}>
            {labels.loginTitle}
          </h1>
          <p className="mt-3 text-sm md:text-base" style={{ color: 'var(--color-muted-foreground)' }}>
            {labels.loginDescription}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-fast active:scale-[0.98]"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <span>{labels.loginAction}</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  const sections = [
    {
      id: 'profile',
      title: labels.profileTitle,
      description: labels.profileDescription,
      icon: UserRound,
    },
    {
      id: 'orders',
      title: labels.ordersTitle,
      description: labels.ordersDescription,
      icon: Package,
    },
    {
      id: 'addresses',
      title: labels.addressesTitle,
      description: labels.addressesDescription,
      icon: MapPin,
    },
    {
      id: 'security',
      title: labels.securityTitle,
      description: labels.securityDescription,
      icon: Shield,
    },
  ];

  return (
    <div className="container-grocery py-8 md:py-12">
      <div
        className="rounded-[32px] border p-6 md:p-8"
        style={{
          borderColor: 'var(--color-border)',
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 55%, white) 0%, var(--color-card) 38%, color-mix(in srgb, var(--color-primary) 8%, white) 100%)',
        }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--color-primary)' }}
            >
              {tNav('account')}
            </p>
            <h1 className="heading-display text-3xl md:text-4xl mt-2" style={{ color: 'var(--color-foreground)' }}>
              {labels.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm md:text-base" style={{ color: 'var(--color-muted-foreground)' }}>
              {labels.subtitle}
            </p>
          </div>

          <div
            className="min-w-0 rounded-2xl border px-5 py-4"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'color-mix(in srgb, var(--color-card) 88%, white)' }}
          >
            <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--color-muted-foreground)' }}>
              {locale === 'pl' ? 'Zalogowano jako' : 'Signed in as'}
            </p>
            <p className="mt-2 text-base font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>
              {session.user?.fullName || tNav('account')}
            </p>
            <p className="text-sm truncate" style={{ color: 'var(--color-muted-foreground)' }}>
              {session.user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 mt-8 md:grid-cols-2">
        {sections.map(({ id, title, description, icon: Icon }) => (
          <section
            key={id}
            id={id}
            className="scroll-mt-32 rounded-2xl border p-5"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>
                    {title}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                    {description}
                  </p>
                </div>
              </div>
              <span
                className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-foreground)' }}
              >
                {labels.status}
              </span>
            </div>
          </section>
        ))}
      </div>

      <section
        className="rounded-2xl border p-5 mt-8"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
      >
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>
          {labels.shortcutsTitle}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
          {labels.shortcutsDescription}
        </p>
        <div className="grid gap-3 mt-5 sm:grid-cols-2">
          <Link
            href="/wishlist"
            className="rounded-2xl border p-4 transition-colors duration-fast hover-surface"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5" aria-hidden="true" />
              <div>
                <p className="font-semibold">{tNav('wishlist')}</p>
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  {locale === 'pl' ? 'Przejd\u017a do zapisanych produkt\u00f3w.' : 'Open your saved products.'}
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/cart"
            className="rounded-2xl border p-4 transition-colors duration-fast hover-surface"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              <div>
                <p className="font-semibold">{tNav('cart')}</p>
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  {locale === 'pl' ? 'Wr\u00f3\u0107 do koszyka i finalizuj zakupy.' : 'Jump back into checkout.'}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

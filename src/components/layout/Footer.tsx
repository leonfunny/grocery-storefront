'use client';

import { useTranslations } from 'next-intl';
import { Leaf } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const tNav = useTranslations('nav');
  const t = useTranslations('footer');

  return (
    <footer
      className="border-t mt-auto"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
      role="contentinfo"
    >
      <div className="container-grocery py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Leaf className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight" style={{ color: 'var(--color-foreground)' }}>
                Grocery
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              {t('tagline')}
            </p>
          </div>

          <nav aria-label={t('shop')}>
            <h3 className="heading-section text-sm mb-4" style={{ color: 'var(--color-foreground)' }}>{t('shop')}</h3>
            <ul className="space-y-2.5" role="list">
              <li><Link href="/products" className="text-sm transition-colors duration-fast hover:text-primary" style={{ color: 'var(--color-muted-foreground)' }}>{tNav('products')}</Link></li>
              <li><Link href="/recipes" className="text-sm transition-colors duration-fast hover:text-primary" style={{ color: 'var(--color-muted-foreground)' }}>{tNav('recipes')}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t('info')}>
            <h3 className="heading-section text-sm mb-4" style={{ color: 'var(--color-foreground)' }}>{t('info')}</h3>
            <ul className="space-y-2.5" role="list">
              <li><Link href="#" className="text-sm transition-colors duration-fast hover:text-primary" style={{ color: 'var(--color-muted-foreground)' }}>{t('about')}</Link></li>
              <li><Link href="#" className="text-sm transition-colors duration-fast hover:text-primary" style={{ color: 'var(--color-muted-foreground)' }}>{t('contact')}</Link></li>
              <li><Link href="#" className="text-sm transition-colors duration-fast hover:text-primary" style={{ color: 'var(--color-muted-foreground)' }}>{t('delivery')}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t('legal')}>
            <h3 className="heading-section text-sm mb-4" style={{ color: 'var(--color-foreground)' }}>{t('legal')}</h3>
            <ul className="space-y-2.5" role="list">
              <li><Link href="/privacy" className="text-sm transition-colors duration-fast hover:text-primary" style={{ color: 'var(--color-muted-foreground)' }}>{t('privacy')}</Link></li>
              <li><Link href="/terms" className="text-sm transition-colors duration-fast hover:text-primary" style={{ color: 'var(--color-muted-foreground)' }}>{t('terms')}</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            &copy; {new Date().getFullYear()} Grocery Store. Powered by Zira AI.
          </p>
        </div>
      </div>
    </footer>
  );
}

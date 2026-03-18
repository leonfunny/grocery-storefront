import type { Metadata, Viewport } from 'next';
import { getLocale } from 'next-intl/server';
import Script from 'next/script';
import { GraphQLProvider } from '@/lib/graphql/provider';
import { CartBootstrap } from '@/components/CartBootstrap';
import { SalonLoader } from '@/components/SalonLoader';
import { SessionBootstrap } from '@/components/SessionBootstrap';
import { AppToaster } from '@/components/layout/AppToaster';
import './globals.css';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STORE_NAME || 'Grocery Store',
  description: process.env.NEXT_PUBLIC_STORE_DESCRIPTION || 'Fresh groceries with full nutritional transparency',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try {
            var theme = localStorage.getItem('grocery-theme') === 'dark' ? 'dark' : 'light';
            document.documentElement.dataset.theme = theme;
          } catch (error) {
            document.documentElement.dataset.theme = 'light';
          }`}
        </Script>
        <GraphQLProvider>
          {!process.env.NEXT_PUBLIC_CHANNEL && <SalonLoader />}
          <SessionBootstrap />
          <CartBootstrap />
          {children}
        </GraphQLProvider>
        <AppToaster />
      </body>
    </html>
  );
}

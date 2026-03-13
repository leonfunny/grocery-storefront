import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { GraphQLProvider } from '@/lib/graphql/provider';
import { SalonLoader } from '@/components/SalonLoader';
import './globals.css';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_STORE_NAME || 'Grocery Store',
  description: process.env.NEXT_PUBLIC_STORE_DESCRIPTION || 'Fresh groceries with full nutritional transparency',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body>
        <GraphQLProvider>
          <SalonLoader />
          {children}
        </GraphQLProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

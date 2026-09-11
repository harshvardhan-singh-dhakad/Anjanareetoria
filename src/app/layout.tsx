import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://arblessings.com'),
  title: 'AR Blessings — Uniquely Designed Gems & Sacred Spiritual Essentials',
  description: 'Shop authentic consecrated prosperity essentials including Karodon Ka Wallet, Karodon Ka Dollar, divine fragrances, and spiritual gems.',
  icons: {
    icon: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="min-h-screen flex flex-col bg-white text-[#2b2b2b]">
        <CartProvider>
          <Header />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <WhatsAppButton />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import {
  OrganizationSchema,
  WebSiteSchema,
  LocalBusinessSchema,
  FAQSchema,
} from '@/components/SchemaMarkup';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://arblessings.com'),
  title: {
    default: 'AR Blessings — Uniquely Designed Gems & Sacred Spiritual Essentials',
    template: '%s | AR Blessings',
  },
  description: 'Shop authentic consecrated prosperity essentials including Karodon Ka Wallet, Karodon Ka Dollar, divine fragrances, and spiritual gems.',
  icons: {
    icon: '/images/logo.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://arblessings.com',
    siteName: 'AR Blessings',
    title: 'AR Blessings — Uniquely Designed Gems & Sacred Spiritual Essentials',
    description: 'Shop authentic consecrated prosperity essentials including Karodon Ka Wallet, Karodon Ka Dollar, divine fragrances, and spiritual gems.',
    images: [
      {
        url: '/images/logo.png',
        width: 512,
        height: 512,
        alt: 'AR Blessings Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AR Blessings — Uniquely Designed Gems & Sacred Spiritual Essentials',
    description: 'Shop authentic consecrated prosperity essentials including Karodon Ka Wallet, Karodon Ka Dollar, divine fragrances, and spiritual gems.',
    images: ['/images/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {},
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.className}>
      <head>
        <link rel="describedby" href="/llms.txt" />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-[#2b2b2b]">
        <OrganizationSchema />
        <WebSiteSchema />
        <LocalBusinessSchema />
        <FAQSchema />
        <AuthProvider>
          <CartProvider>
            <Header />
            <CartDrawer />
            <AuthModal />
            <main className="flex-1">{children}</main>
            <WhatsAppButton />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

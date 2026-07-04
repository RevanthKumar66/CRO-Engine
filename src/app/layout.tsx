import type { Metadata } from 'next';
import { geistSans, geistMono } from './fonts';
import '../styles/globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'CRO Engine — Shopify Conversion Rate Optimization',
    template: '%s | CRO Engine',
  },
  description:
    'Instantly scan Shopify storefront layouts, copywriting, and CTAs against e-commerce psychology heuristics for conversion optimization.',
  keywords: [
    'shopify',
    'cro',
    'conversion rate optimization',
    'heuristic review',
    'gemini ai',
    'ux audit',
  ],
  authors: [{ name: 'CRO Engine Team' }],
  applicationName: 'CRO Engine',
  themeColor: '#1e40af',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://cro-engine.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'CRO Engine — Shopify Conversion Rate Optimization',
    description:
      'Instantly scan Shopify storefront layouts, copywriting, and CTAs against e-commerce psychology heuristics for conversion optimization.',
    url: 'https://cro-engine.vercel.app',
    siteName: 'CRO Engine',
    images: [
      {
        url: '/assets/cro-ico-logo.png',
        width: 512,
        height: 512,
        alt: 'CRO Engine App Icon',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CRO Engine — Shopify Conversion Rate Optimization',
    description:
      'Instantly scan Shopify storefront layouts, copywriting, and CTAs against e-commerce psychology heuristics.',
    images: ['/assets/cro-ico-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/favicon.ico',
    shortcut: '/assets/favicon.ico',
    apple: '/assets/cro-ico-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-bg-primary text-text-primary antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { DM_Sans, Bebas_Neue, DM_Mono } from 'next/font/google';
import CookieConsent from '@/components/ui/CookieConsent';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas' });
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dm-mono' });

export const metadata: Metadata = {
  title: 'Pitchside — Gaelic & Soccer Tactics Platform',
  description: 'The professional tactics platform for Gaelic Football, Hurling, and Soccer coaches. Draw plays, animate movements, share with your team.',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#00d46e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${dmSans.variable} ${bebasNeue.variable} ${dmMono.variable} antialiased`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

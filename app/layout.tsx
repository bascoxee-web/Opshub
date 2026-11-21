import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-partner-sans',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-partner-mono',
});

export const metadata: Metadata = {
  title: 'CreatorDesk Pro — Social Commerce & Team Access Workspace',
  description:
    'Team subscription workspace for US seller verification, delegated account access, creative editing, and social publishing.',
  applicationName: 'CreatorDesk Pro',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CreatorDesk Pro',
  },
  openGraph: {
    title: 'CreatorDesk Pro — Social Commerce & Team Access Workspace',
    description:
      'Unified team workspace for US seller verification, delegated account access, creative editing, and social publishing.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CreatorDesk Pro — Social Commerce & Team Access Workspace',
    description:
      'Team subscription workspace for US seller verification, delegated account access, creative editing, and social publishing.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0F1E36' },
    { media: '(prefers-color-scheme: dark)', color: '#0A1628' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

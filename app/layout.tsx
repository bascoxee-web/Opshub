import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GateDesk — Self-Storage Operations & Branded Tenant App',
  description:
    'Never miss a tenant again. Missed-call alerts, help requests, referral tracking, and branded Tenant App. Powered by Retch VisionAI Solution.',
  applicationName: 'GateDesk',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GateDesk',
  },
  openGraph: {
    title: 'GateDesk — Never Miss a Storage Tenant Again',
    description:
      'Turn missed calls into booked self-storage units, automate renter referrals, and give tenants their own branded app. Powered by Retch VisionAI Solution.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GateDesk — Self-Storage Operations & Tenant App',
    description:
      'Never miss a tenant again. Missed-call alerts, help requests, and branded Tenant App for independent storage owners.',
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

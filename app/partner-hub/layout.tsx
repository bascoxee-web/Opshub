import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';

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
  openGraph: {
    title: 'CreatorDesk Pro — Social Commerce & Team Access Workspace',
    description:
      'Unified team workspace for US seller verification, delegated account access, creative editing, and social publishing.',
    type: 'website',
  },
};

export default function PartnerHubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${plusJakartaSans.variable} ${jetBrainsMono.variable} font-sans min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}
    >
      {children}
    </div>
  );
}

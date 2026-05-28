import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'GhostIn — LinkedIn Ghostwriting & Lead Generation',
  description: 'AI-powered LinkedIn ghostwriting, lead magnet builder, and DM automation. Turn your expertise into booked calls on autopilot.',
  keywords: ['LinkedIn ghostwriting', 'lead generation', 'AI content', 'DM automation'],
  openGraph: {
    title: 'GhostIn',
    description: 'AI-powered LinkedIn ghostwriting & lead generation',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

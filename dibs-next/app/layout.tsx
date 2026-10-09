import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from './providers';

export const metadata: Metadata = {
  title: 'Dibs',
  description: 'Buy and sell with verified students. Store it over summer with Summer Hold.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1F3D2B',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

import './globals.css';
import Providers from '@/components/Providers';
import EmotionRegistry from '@/components/EmotionRegistry';
import { ReactNode } from 'react';

export const metadata = { title: 'English Learning App', description: 'Learn English effectively' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <EmotionRegistry>
          <Providers>{children}</Providers>
        </EmotionRegistry>
      </body>
    </html>
  );
}

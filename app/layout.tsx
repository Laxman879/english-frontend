import './globals.css';
import Providers from '@/components/Providers';
import EmotionRegistry from '@/components/EmotionRegistry';
import { ReactNode } from 'react';
import { Poppins, Roboto, Noto_Sans_Telugu } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-poppins', display: 'swap' });
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-roboto', display: 'swap' });
const notoSansTelugu = Noto_Sans_Telugu({ subsets: ['telugu'], weight: ['400', '600', '700'], variable: '--font-telugu', display: 'swap' });

export const metadata = { title: 'English Learning App', description: 'Learn English effectively' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning
      className={`${poppins.variable} ${roboto.variable} ${notoSansTelugu.variable}`}>
      <body>
        <EmotionRegistry>
          <Providers>{children}</Providers>
        </EmotionRegistry>
      </body>
    </html>
  );
}

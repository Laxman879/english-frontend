import type { MetadataRoute } from 'next';

// Web App Manifest — makes the site installable as a standalone PWA.
// Next.js auto-injects <link rel="manifest"> from this file.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Polyglot Punch — English Learning',
    short_name: 'Polyglot Punch',
    description: 'Learn English with vocabulary, stories, and daily practice.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b1120',
    theme_color: '#16a34a',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

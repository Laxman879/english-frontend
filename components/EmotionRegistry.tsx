'use client';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useState } from 'react';

export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => {
    const c = createCache({ key: 'css' });
    c.compat = true;
    return c;
  });

  useServerInsertedHTML(() => (
    <style
      data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
      dangerouslySetInnerHTML={{ __html: Object.values(cache.inserted).join(' ') }}
    />
  ));

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

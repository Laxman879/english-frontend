import { ImageResponse } from 'next/og';

// Generated app icon (favicon + PWA manifest icon). Built at build time.
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #15803d, #22c55e)',
          color: 'white',
          fontSize: 300,
          fontWeight: 800,
          letterSpacing: -12,
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from 'next/og';

// Generated Apple touch icon for iOS "Add to Home Screen".
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          fontSize: 108,
          fontWeight: 800,
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}

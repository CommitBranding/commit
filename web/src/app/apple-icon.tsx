import {ImageResponse} from 'next/og'

export const size = {width: 180, height: 180}
export const contentType = 'image/png'

/** Home-screen icon: brand yellow circle (iOS ignores SVG icons). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: 90,
            background: '#FEE064',
          }}
        />
      </div>
    ),
    size,
  )
}

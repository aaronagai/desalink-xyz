import type { CSSProperties, ReactNode } from 'react'
import './tablet.css'

// An iPad, drawn the way the kit draws its iPhone: real geometry in points,
// the screen laid out at true size and scaled as a whole, so type inside it
// renders at iPadOS sizes. The 11-inch iPad Air in landscape: screen
// 1180 × 820 with 18pt corners, a 44pt black bezel with the front camera
// centred on the top (landscape) edge, a thin aluminium band around it,
// body corners concentric with the screen's. Status bar 24pt: time and date
// on the left, Wi-Fi and battery on the right. The kit has no tablet frame;
// this sits beside it with the same rules (never draw a device by hand).

export const IPAD = { w: 1180, h: 820, r: 18, bezel: 44, band: 3 }

export function Tablet({ width, portrait = false, time = '1:05', date = 'Tue 3 Nov', className, style, children }: {
  width: number
  /** Portrait: 820 × 1180, the front camera then on the left edge's bezel. */
  portrait?: boolean
  time?: string
  date?: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  const edge = IPAD.bezel + IPAD.band
  const W = portrait ? IPAD.h : IPAD.w
  const H = portrait ? IPAD.w : IPAD.h
  const s = width / (W + edge * 2)
  const pt = (n: number) => n * s
  return (
    <div
      className={`tb${className ? ` ${className}` : ''}`}
      style={{ width, height: pt(H + edge * 2), padding: pt(IPAD.band), borderRadius: pt(IPAD.r + edge), ...style }}
    >
      <div className="tb__glass" style={{ padding: pt(IPAD.bezel), borderRadius: pt(IPAD.r + IPAD.bezel) }}>
        <span className="tb__camera" data-side={portrait ? 'left' : 'top'} style={portrait ? { left: pt(IPAD.bezel / 2 - 3), width: pt(6), height: pt(6) } : { top: pt(IPAD.bezel / 2 - 3), width: pt(6), height: pt(6) }} />
        <div className="tb__window" style={{ width: pt(W), height: pt(H), borderRadius: pt(IPAD.r) }}>
          <div className="tb__screen" style={{ width: W, height: H, transform: `scale(${s})` }}>
            <div className="tb__status">
              <span>
                {time}
                <span className="tb__date">{date}</span>
              </span>
              <span className="tb__glyphs">
                <svg viewBox="0 0 19.33 14.33" width="17" height="12.6" aria-hidden>
                  <path fill="currentColor" d="M.42 5.54c.49.5 1.24.42 1.86-.13C4.3 3.58 6.84 2.64 9.67 2.64s5.38.97 7.4 2.77c.6.56 1.35.62 1.85.13.5-.52.57-1.29.06-1.83C16.83 1.52 13.33 0 9.67 0S2.49 1.53.36 3.72c-.52.53-.46 1.3.06 1.82zm3.53 3.6c.56.54 1.27.48 1.9-.03a6.2 6.2 0 0 1 3.82-1.36c1.4 0 2.77.54 3.82 1.37.63.52 1.37.55 1.92 0 .53-.54.61-1.37.06-1.89a8.47 8.47 0 0 0-5.78-2.12c-2.3 0-4.4.87-5.78 2.12-.49.46-.59 1.25.05 1.9zm4.78 4.75c.61.59 1.25.59 1.87 0l1.16-1.11c.61-.6.74-1.36.04-1.88a3.6 3.6 0 0 0-4.26.01c-.7.5-.56 1.28.06 1.87l1.13 1.11z" />
                </svg>
                <span className="tb__battery">
                  <span className="tb__battery-pct">100%</span>
                  <svg viewBox="0 0 29.33 13.67" width="25" height="11.7" aria-hidden>
                    <rect x="0.5" y="0.5" width="25" height="12.67" rx="4" fill="none" stroke="currentColor" strokeOpacity=".4" />
                    <rect x="2.5" y="2.5" width="21" height="8.67" rx="2.2" fill="currentColor" />
                    <path d="M27.3 4.6v4.4c.9-.3 1.5-1.2 1.5-2.2s-.6-1.9-1.5-2.2z" fill="currentColor" fillOpacity=".4" />
                  </svg>
                </span>
              </span>
            </div>
            <div className="tb__content">{children}</div>
            <span className="tb__home" />
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import type { ReactNode } from 'react'

/**
 * Circular "deep well" shell around the orb: a dark radial gradient plus a
 * layered inset shadow to fake looking straight down into a recessed shaft,
 * with the orb sitting at the bottom, lit from above.
 */
export function DeepWell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex size-full items-center justify-center">
      <div
        className="relative aspect-square w-[min(62vh,62vw,560px)] rounded-full"
        style={{
          background:
            'radial-gradient(circle at 50% 38%, oklch(0.22 0.004 264) 0%, oklch(0.14 0.004 264) 42%, oklch(0.07 0.003 264) 72%, oklch(0.04 0.002 264) 100%)',
          boxShadow:
            'inset 0 18px 60px 10px oklch(0 0 0 / 85%), inset 0 -6px 30px 0 oklch(1 0 0 / 4%), inset 0 0 0 1px oklch(1 0 0 / 6%), 0 30px 80px -20px oklch(0 0 0 / 70%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-[6%] rounded-full"
          style={{
            boxShadow: 'inset 0 12px 40px 4px oklch(0 0 0 / 70%)',
          }}
        />
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
  )
}

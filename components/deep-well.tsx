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
      {/* Soft ambient halo so the dark well reads as an intentional spotlight
          against the white page instead of a harsh floating disc. */}
      <div
        className="pointer-events-none absolute aspect-square w-[min(70vh,70vw,640px)] rounded-full"
        style={{ boxShadow: '0 0 120px 40px oklch(0 0 0 / 6%)' }}
      />
      <div
        // overflow-hidden is required here: the WebGL canvas inside is a
        // plain rectangle, and without clipping, its square corners peek out
        // past this circular mask whenever the canvas repaints (e.g. while
        // dragging the orb) instead of being cropped to the circle.
        className="relative aspect-square w-[min(62vh,62vw,560px)] overflow-hidden rounded-full"
        style={{
          background:
            'radial-gradient(circle at 50% 38%, oklch(0.32 0.006 264) 0%, oklch(0.22 0.005 264) 42%, oklch(0.13 0.004 264) 72%, oklch(0.09 0.003 264) 100%)',
          boxShadow:
            'inset 0 18px 60px 10px oklch(0 0 0 / 65%), inset 0 -6px 30px 0 oklch(1 0 0 / 6%), inset 0 0 0 1px oklch(1 0 0 / 8%), 0 30px 80px -20px oklch(0 0 0 / 35%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-[6%] rounded-full"
          style={{
            boxShadow: 'inset 0 12px 40px 4px oklch(0 0 0 / 50%)',
          }}
        />
        <div className="absolute inset-0 [&>div]:!size-full [&_canvas]:!size-full">{children}</div>
      </div>
    </div>
  )
}

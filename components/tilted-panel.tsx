'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * A side panel tilted inward around its vertical hinge (the outer screen
 * edge), as if the whole surface leans toward the viewer/center — like the
 * inner walls of the deep well continuing outward.
 */
export function TiltedPanel({
  side,
  children,
  className,
}: {
  side: 'left' | 'right'
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'hidden shrink-0 md:flex md:items-center',
        // Anchor each panel to its own outer screen edge so no gap opens up
        // between the panel and the viewport edge.
        side === 'left' ? 'md:justify-start' : 'md:justify-end',
      )}
      style={{ perspective: '1600px', width: 'clamp(248px, 21vw, 372px)' }}
    >
      <div
        className={cn(
          'glass-grain relative h-[88%] w-full overflow-hidden border border-border/70 bg-card/60 backdrop-blur-2xl backdrop-saturate-150 backdrop-contrast-105',
          side === 'left' ? 'rounded-r-2xl border-l-0' : 'rounded-l-2xl border-r-0',
          className,
        )}
        style={{
          transform: side === 'left' ? 'rotateY(14deg)' : 'rotateY(-14deg)',
          transformOrigin: side === 'left' ? 'left center' : 'right center',
          // Layered like real glass: a bright rim where ambient light from
          // above catches the top edge, a soft glint along the inner edge
          // (the side that tilts toward the glowing orb/backdrop), and a
          // deep contact shadow lifting the pane off the fluid field.
          boxShadow: [
            'inset 0 1px 0 0 rgb(255 255 255 / 0.5)',
            side === 'left' ? 'inset -1px 0 0 0 rgb(255 255 255 / 0.4)' : 'inset 1px 0 0 0 rgb(255 255 255 / 0.4)',
            'inset 0 -1px 0 0 rgb(0 0 0 / 0.05)',
            '0 30px 80px -24px rgb(20 18 30 / 0.5)',
          ].join(', '),
        }}
      >
        {/* Ambient sheen sliding in from the inner (center-facing) edge, as
            if the fluid backdrop's glow is glancing off the glass surface. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] mix-blend-overlay"
          style={{
            background:
              side === 'left'
                ? 'linear-gradient(100deg, transparent 42%, rgb(255 255 255 / 0.22) 82%, rgb(255 255 255 / 0.05) 100%)'
                : 'linear-gradient(260deg, transparent 42%, rgb(255 255 255 / 0.22) 82%, rgb(255 255 255 / 0.05) 100%)',
          }}
        />
        {/* Soft top-down light falloff, grounding the panel under the same
            overhead light implied by the orb's glow. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-20 bg-gradient-to-b from-white/20 to-transparent"
        />
        <div className="relative z-[2] h-full">{children}</div>
      </div>
    </div>
  )
}

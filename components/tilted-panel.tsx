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
          'h-[88%] w-full border border-border bg-card/80 shadow-2xl shadow-black/10 backdrop-blur-xl',
          side === 'left' ? 'rounded-r-2xl border-l-0' : 'rounded-l-2xl border-r-0',
          className,
        )}
        style={{
          transform: side === 'left' ? 'rotateY(14deg)' : 'rotateY(-14deg)',
          transformOrigin: side === 'left' ? 'left center' : 'right center',
        }}
      >
        {children}
      </div>
    </div>
  )
}

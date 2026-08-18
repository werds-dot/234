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
      className="hidden shrink-0 md:block"
      style={{ perspective: '1600px', width: 'clamp(200px, 17vw, 260px)' }}
    >
      <div
        className={cn(
          'h-full border border-border/50 bg-card/60 shadow-2xl shadow-black/50 backdrop-blur-xl',
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

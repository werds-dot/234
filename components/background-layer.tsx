'use client'

import { useBackground } from '@/lib/background-store'

/**
 * Full-viewport backdrop rendered once in the root layout, behind the nav
 * rail and page content. Reflects the user's saved preference: an animated
 * "fluid" gradient field, a flat solid color, or an uploaded image.
 */
export function BackgroundLayer() {
  const { pref } = useBackground()

  if (pref.mode === 'image' && pref.imageDataUrl) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${pref.imageDataUrl})` }}
      >
        <div className="absolute inset-0 bg-background/30" />
      </div>
    )
  }

  if (pref.mode === 'solid') {
    return (
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" style={{ backgroundColor: pref.color }} />
    )
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      <div
        className="absolute top-[-10%] left-[-10%] size-[70vmax] rounded-full opacity-[0.16] blur-3xl"
        style={{
          background: 'radial-gradient(circle, oklch(0.55 0.14 55) 0%, transparent 70%)',
          animation: 'fluid-drift-a 22s ease-in-out infinite',
        }}
      />
      <div
        className="absolute right-[-15%] bottom-[-15%] size-[65vmax] rounded-full opacity-[0.14] blur-3xl"
        style={{
          background: 'radial-gradient(circle, oklch(0.55 0.1 190) 0%, transparent 70%)',
          animation: 'fluid-drift-b 26s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-[20%] right-[10%] size-[50vmax] rounded-full opacity-[0.1] blur-3xl"
        style={{
          background: 'radial-gradient(circle, oklch(0.75 0.01 264) 0%, transparent 70%)',
          animation: 'fluid-drift-c 30s ease-in-out infinite',
        }}
      />
    </div>
  )
}

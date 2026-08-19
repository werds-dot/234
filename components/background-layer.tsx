'use client'

import { useBackground } from '@/lib/background-store'
import { LiquidChrome } from '@/components/ui/liquid-chrome'

/**
 * Fixed, full-viewport backdrop rendered once at the app root, behind the
 * page content. The tilted side panels and voice console cards are
 * deliberately translucent (bg-card/80, bg-card/95 + backdrop-blur), so
 * whichever mode is active here shows through as a soft frosted-glass
 * effect rather than a flat page background.
 */
export function BackgroundLayer() {
  const { pref } = useBackground()

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background" aria-hidden="true">
      {pref.mode === 'fluid' && (
        <>
          {/* WebGL liquid-chrome field. A soft radial white wash keeps the
              center (orb + header text) legible while the metallic marbling
              stays visible toward the edges behind the frosted panels. */}
          <div className="absolute inset-0">
            <LiquidChrome
              baseColor={[0.16, 0.15, 0.21]}
              speed={0.4}
              amplitude={0.4}
              frequencyX={2.5}
              frequencyY={2}
              interactive
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, oklch(1 0 0 / 0.55) 0%, oklch(1 0 0 / 0.34) 40%, oklch(1 0 0 / 0.24) 100%)',
            }}
          />
        </>
      )}

      {pref.mode === 'solid' && <div className="absolute inset-0" style={{ backgroundColor: pref.color }} />}

      {pref.mode === 'image' && pref.imageDataUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${pref.imageDataUrl})` }}
        />
      )}
    </div>
  )
}

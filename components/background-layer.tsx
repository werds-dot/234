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
    <div className="fixed inset-0 z-0 overflow-hidden bg-background" aria-hidden="true">
      {pref.mode === 'fluid' && (
        <>
          {/* WebGL liquid-chrome field. The shader divides baseColor by
              abs(sin(...)), so it blows out to white along the zero-crossing
              bands (the chrome highlights). A CSS contrast+brightness filter
              tames that glare into a moody metallic backdrop while the frosted
              panels/orb read clearly on top. */}
          <div className="absolute inset-0" style={{ filter: 'contrast(1.3) brightness(0.55)' }}>
            <LiquidChrome
              baseColor={[0.28, 0.27, 0.36]}
              speed={0.4}
              amplitude={0.4}
              frequencyX={2.5}
              frequencyY={2}
              interactive
            />
          </div>
          {/* Center glow keeps the orb + header text legible. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, oklch(0.98 0.005 264 / 0.35) 0%, transparent 46%)',
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

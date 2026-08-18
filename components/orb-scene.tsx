'use client'

import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Suspense } from 'react'
import { LiquidMetalOrb } from './liquid-metal-orb'
import type { OrbAudioRefs } from '@/hooks/use-voice-orb'

// No OrbitControls here on purpose: pointer drags are reserved for grabbing
// and stretching the orb itself, so an orbit gesture would fight the pinch.
export function OrbScene({ audio }: { audio: OrbAudioRefs }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.4], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'none', cursor: 'grab' }}
    >
      {/* Brighter than a pure studio setup: the orb sits inside a dark well,
          so it needs enough ambient/fill light to stay visible instead of
          dissolving into the backdrop. */}
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 3, 4]} intensity={12} color="#f5f5f8" />
      <pointLight position={[-3, -2, -3]} intensity={8} color="#d8dae0" />
      <pointLight position={[0, -3, 2]} intensity={4} color="#c9ccd4" />
      <Suspense fallback={null}>
        <Environment preset="city" environmentIntensity={1.5} />
        <LiquidMetalOrb audio={audio} />
      </Suspense>
    </Canvas>
  )
}

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
      <ambientLight intensity={0.15} />
      <pointLight position={[3, 3, 4]} intensity={10} color="#f2f2f5" />
      <pointLight position={[-3, -2, -3]} intensity={5} color="#c9ccd4" />
      <Suspense fallback={null}>
        <Environment preset="night" environmentIntensity={1.1} />
        <LiquidMetalOrb audio={audio} />
      </Suspense>
    </Canvas>
  )
}

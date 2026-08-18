'use client'

import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { LiquidMetalOrb } from './liquid-metal-orb'
import type { OrbAudioRefs } from '@/hooks/use-voice-orb'

export function OrbScene({ audio }: { audio: OrbAudioRefs }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.6], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.15} />
      <pointLight position={[3, 3, 4]} intensity={12} color="#f5a25a" />
      <pointLight position={[-3, -2, -3]} intensity={6} color="#5eead4" />
      <Suspense fallback={null}>
        <Environment preset="night" environmentIntensity={1.1} />
        <LiquidMetalOrb audio={audio} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        rotateSpeed={0.5}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(2 * Math.PI) / 3}
      />
    </Canvas>
  )
}

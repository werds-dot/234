'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createLiquidMetalMaterial } from '@/lib/liquid-metal-material'
import type { OrbAudioRefs } from '@/hooks/use-voice-orb'

const AMBER = new THREE.Color('#f5a25a')
const TEAL = new THREE.Color('#5eead4')
const DIM = new THREE.Color('#8a8d94')

function average(data: Uint8Array, start: number, end: number) {
  let sum = 0
  const from = Math.max(0, Math.floor(start))
  const to = Math.min(data.length, Math.ceil(end))
  for (let i = from; i < to; i++) sum += data[i]
  return to > from ? sum / (to - from) / 255 : 0
}

export function LiquidMetalOrb({ audio }: { audio: OrbAudioRefs }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.35, 48), [])
  const { material, uniforms } = useMemo(() => createLiquidMetalMaterial(), [])

  const smoothed = useRef({ bass: 0, mid: 0, treble: 0, level: 0 })

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const mode = audio.modeRef.current
    let bass = 0
    let mid = 0
    let treble = 0

    if (mode === 'listening' && audio.analyserRef.current && audio.freqDataRef.current) {
      audio.analyserRef.current.getByteFrequencyData(audio.freqDataRef.current)
      const data = audio.freqDataRef.current
      bass = average(data, 0, data.length * 0.15)
      mid = average(data, data.length * 0.15, data.length * 0.5)
      treble = average(data, data.length * 0.5, data.length)
    } else if (mode === 'speaking') {
      const now = performance.now()
      audio.spikesRef.current = audio.spikesRef.current.filter((ts) => now - ts < 380)
      let spikeSum = 0
      for (const ts of audio.spikesRef.current) {
        spikeSum += Math.max(0, 1 - (now - ts) / 380)
      }
      const hum = 0.22 + 0.12 * Math.sin(t * 7)
      const level = Math.min(1, hum + spikeSum * 0.7)
      bass = level * 0.85
      mid = level
      treble = level * 0.6
    } else if (mode === 'thinking') {
      const level = 0.35 + 0.15 * Math.sin(t * 10)
      bass = level * 0.5
      mid = level
      treble = level * 0.8
    } else {
      const level = 0.08 + 0.04 * Math.sin(t * 0.7)
      bass = level
      mid = level * 0.7
      treble = level * 0.3
    }

    const s = smoothed.current
    s.bass = THREE.MathUtils.lerp(s.bass, bass, 0.15)
    s.mid = THREE.MathUtils.lerp(s.mid, mid, 0.15)
    s.treble = THREE.MathUtils.lerp(s.treble, treble, 0.2)
    s.level = THREE.MathUtils.lerp(s.level, (bass + mid + treble) / 3, 0.15)

    uniforms.uTime.value = t
    uniforms.uBass.value = s.bass
    uniforms.uMid.value = s.mid
    uniforms.uTreble.value = s.treble

    const targetColor = mode === 'listening' ? TEAL : mode === 'speaking' || mode === 'thinking' ? AMBER : DIM
    material.emissive.lerp(targetColor, 0.08)
    const idleFloor = mode === 'idle' ? 0.03 : 0.08
    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, idleFloor + s.level * 1.1, 0.1)

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (0.06 + s.level * 0.15)
      meshRef.current.rotation.x = Math.sin(t * 0.15) * 0.08
      const scale = 1 + s.bass * 0.08
      meshRef.current.scale.setScalar(scale)
    }
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}

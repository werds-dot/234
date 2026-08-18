'use client'

import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createLiquidMetalMaterial } from '@/lib/liquid-metal-material'
import type { OrbAudioRefs } from '@/hooks/use-voice-orb'

function average(data: Uint8Array, start: number, end: number) {
  let sum = 0
  const from = Math.max(0, Math.floor(start))
  const to = Math.min(data.length, Math.ceil(end))
  for (let i = from; i < to; i++) sum += data[i]
  return to > from ? sum / (to - from) / 255 : 0
}

const ORB_RADIUS = 0.9

export function LiquidMetalOrb({ audio }: { audio: OrbAudioRefs }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(ORB_RADIUS, 48), [])
  const { material, uniforms } = useMemo(() => createLiquidMetalMaterial(), [])

  const smoothed = useRef({ bass: 0, mid: 0, treble: 0, level: 0 })

  // Drag-to-stretch state: a spring-damped strength value chases a target
  // set while the pointer is down, then settles back to 0 with a light
  // bounce once released, so the blob feels elastic rather than rubbery.
  const drag = useRef({
    isDragging: false,
    pointerId: -1,
    target: 0,
    strength: 0,
    velocity: 0,
  })

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    const mesh = meshRef.current
    if (!mesh) return
    try {
      ;(event.nativeEvent.target as Element)?.setPointerCapture?.(event.pointerId)
    } catch {
      // Pointer capture can fail for synthetic/edge-case events; the drag
      // still works via the mesh's own pointer handlers.
    }
    drag.current.isDragging = true
    drag.current.pointerId = event.pointerId
    drag.current.target = 0.9
    const local = mesh.worldToLocal(event.point.clone())
    uniforms.uDragDir.value.copy(local.normalize())
  }

  function handlePointerMove(event: ThreeEvent<PointerEvent>) {
    if (!drag.current.isDragging) return
    const mesh = meshRef.current
    if (!mesh) return
    const local = mesh.worldToLocal(event.point.clone())
    if (local.lengthSq() > 0.0001) {
      uniforms.uDragDir.value.lerp(local.normalize(), 0.5)
    }
  }

  function handlePointerUp(event: ThreeEvent<PointerEvent>) {
    try {
      ;(event.nativeEvent.target as Element)?.releasePointerCapture?.(event.pointerId)
    } catch {
      // No-op: nothing to release if capture was never established.
    }
    drag.current.isDragging = false
    drag.current.target = 0
  }

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

    // Fixed metallic color for every mode; only brightness breathes with level.
    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0.03 + s.level * 0.5, 0.1)

    // Spring the drag strength toward its target with a bit of overshoot,
    // giving the pull/release an elastic, liquid feel.
    const d = drag.current
    const stiffness = d.isDragging ? 22 : 9
    const damping = d.isDragging ? 10 : 4.5
    d.velocity += (d.target - d.strength) * stiffness * delta
    d.velocity *= 1 - Math.min(1, damping * delta)
    d.strength += d.velocity * delta
    uniforms.uDragStrength.value = Math.max(0, d.strength)

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (0.06 + s.level * 0.15)
      meshRef.current.rotation.x = Math.sin(t * 0.15) * 0.08
      const scale = 1 + s.bass * 0.06
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  )
}

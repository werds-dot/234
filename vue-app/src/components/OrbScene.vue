<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createLiquidMetalMaterial } from '../lib/liquid-metal-material'
import type { OrbAudioState } from '../composables/useVoiceOrb'

// Native Three.js port of the React Three Fiber orb scene. No OrbitControls
// on purpose: pointer drags are reserved for grabbing and stretching the
// orb itself, so an orbit gesture would fight the pinch.
const props = defineProps<{ audio: OrbAudioState }>()

const canvasHost = ref<HTMLDivElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let mesh: THREE.Mesh | null = null
let uniforms: ReturnType<typeof createLiquidMetalMaterial>['uniforms'] | null = null
let material: THREE.MeshPhysicalMaterial | null = null
let raf = 0
let resizeObserver: ResizeObserver | null = null

const ORB_RADIUS = 0.9
const smoothed = { bass: 0, mid: 0, treble: 0, level: 0 }

const drag = {
  isDragging: false,
  pointerId: -1,
  target: 0,
  strength: 0,
  velocity: 0,
}

function average(data: Uint8Array, start: number, end: number) {
  let sum = 0
  const from = Math.max(0, Math.floor(start))
  const to = Math.min(data.length, Math.ceil(end))
  for (let i = from; i < to; i++) sum += data[i]
  return to > from ? sum / (to - from) / 255 : 0
}

function worldToLocalNormalized(point: THREE.Vector3): THREE.Vector3 {
  if (!mesh) return new THREE.Vector3(0, 1, 0)
  const local = mesh.worldToLocal(point.clone())
  if (local.lengthSq() < 0.0001) return new THREE.Vector3(0, 1, 0)
  return local.normalize()
}

function pointerToWorld(event: PointerEvent, host: HTMLDivElement): THREE.Vector3 | null {
  if (!camera || !mesh) return null
  const rect = host.getBoundingClientRect()
  const ndc = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  )
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(ndc, camera)
  const hits = raycaster.intersectObject(mesh)
  return hits[0]?.point ?? null
}

function handlePointerDown(event: PointerEvent) {
  const host = canvasHost.value
  if (!host || !mesh || !uniforms) return
  const point = pointerToWorld(event, host)
  if (!point) return
  try {
    host.setPointerCapture(event.pointerId)
  } catch {
    // Pointer capture can fail for synthetic/edge-case events; the drag
    // still works via the move/up listeners on the host.
  }
  drag.isDragging = true
  drag.pointerId = event.pointerId
  drag.target = 0.9
  uniforms.uDragDir.value.copy(worldToLocalNormalized(point))
}

function handlePointerMove(event: PointerEvent) {
  if (!drag.isDragging || !uniforms) return
  const host = canvasHost.value
  if (!host) return
  const point = pointerToWorld(event, host)
  if (!point) return
  uniforms.uDragDir.value.lerp(worldToLocalNormalized(point), 0.5)
}

function handlePointerUp(event: PointerEvent) {
  const host = canvasHost.value
  try {
    host?.releasePointerCapture(event.pointerId)
  } catch {
    // No-op: nothing to release if capture was never established.
  }
  drag.isDragging = false
  drag.target = 0
}

function animate() {
  raf = requestAnimationFrame(animate)
  if (!renderer || !scene || !camera || !mesh || !uniforms || !material) return

  const delta = clock.getDelta()
  const t = clock.getElapsedTime()

  const analyser = props.audio.analyser
  const freqData = props.audio.freqData
  if (analyser && freqData) {
    analyser.getByteFrequencyData(freqData)
    const bass = average(freqData, 0, freqData.length * 0.12)
    const mid = average(freqData, freqData.length * 0.12, freqData.length * 0.5)
    const treble = average(freqData, freqData.length * 0.5, freqData.length)
    smoothed.bass = THREE.MathUtils.lerp(smoothed.bass, bass, 0.25)
    smoothed.mid = THREE.MathUtils.lerp(smoothed.mid, mid, 0.25)
    smoothed.treble = THREE.MathUtils.lerp(smoothed.treble, treble, 0.3)
    smoothed.level = (smoothed.bass + smoothed.mid + smoothed.treble) / 3
  } else {
    // Idle micro-motion so the orb never looks fully static.
    smoothed.bass = THREE.MathUtils.lerp(smoothed.bass, 0.06 + Math.sin(t * 0.6) * 0.02, 0.05)
    smoothed.mid = THREE.MathUtils.lerp(smoothed.mid, 0.05, 0.05)
    smoothed.treble = THREE.MathUtils.lerp(smoothed.treble, 0.04, 0.05)
    smoothed.level = THREE.MathUtils.lerp(smoothed.level, 0.05, 0.05)
  }

  uniforms.uTime.value = t
  uniforms.uBass.value = smoothed.bass
  uniforms.uMid.value = smoothed.mid
  uniforms.uTreble.value = smoothed.treble

  // Fixed metallic color for every mode; only brightness breathes with level.
  material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0.03 + smoothed.level * 0.5, 0.1)

  const stiffness = drag.isDragging ? 22 : 9
  const damping = drag.isDragging ? 10 : 4.5
  drag.velocity += (drag.target - drag.strength) * stiffness * delta
  drag.velocity *= 1 - Math.min(1, damping * delta)
  drag.strength += drag.velocity * delta
  uniforms.uDragStrength.value = Math.max(0, drag.strength)

  mesh.rotation.y += delta * (0.06 + smoothed.level * 0.15)
  mesh.rotation.x = Math.sin(t * 0.15) * 0.08
  const scale = 1 + smoothed.bass * 0.06
  mesh.scale.setScalar(scale)

  renderer.render(scene, camera)
}

const clock = new THREE.Clock()

onMounted(() => {
  const host = canvasHost.value
  if (!host) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 0, 3.4)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  host.appendChild(renderer.domElement)
  renderer.domElement.style.touchAction = 'none'
  renderer.domElement.style.cursor = 'grab'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'

  // A neutral studio-like environment gives the metallic/iridescent
  // material something to reflect, mirroring drei's "night" preset.
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const ambient = new THREE.AmbientLight('#ffffff', 0.15)
  const key = new THREE.PointLight('#f2f2f5', 10, 0, 0)
  key.position.set(3, 3, 4)
  const fill = new THREE.PointLight('#c9ccd4', 5, 0, 0)
  fill.position.set(-3, -2, -3)
  scene.add(ambient, key, fill)

  const geometry = new THREE.IcosahedronGeometry(ORB_RADIUS, 48)
  const created = createLiquidMetalMaterial()
  uniforms = created.uniforms
  material = created.material
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  function resize() {
    if (!renderer || !camera || !host) return
    const { clientWidth, clientHeight } = host
    if (clientWidth === 0 || clientHeight === 0) return
    renderer.setSize(clientWidth, clientHeight, false)
    camera.aspect = clientWidth / clientHeight
    camera.updateProjectionMatrix()
  }
  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)

  host.addEventListener('pointerdown', handlePointerDown)
  host.addEventListener('pointermove', handlePointerMove)
  host.addEventListener('pointerup', handlePointerUp)
  host.addEventListener('pointerleave', handlePointerUp)

  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  resizeObserver?.disconnect()
  const host = canvasHost.value
  if (host) {
    host.removeEventListener('pointerdown', handlePointerDown)
    host.removeEventListener('pointermove', handlePointerMove)
    host.removeEventListener('pointerup', handlePointerUp)
    host.removeEventListener('pointerleave', handlePointerUp)
  }
  renderer?.dispose()
  material?.dispose()
})
</script>

<template>
  <div ref="canvasHost" class="h-full w-full" />
</template>

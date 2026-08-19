<script setup lang="ts">
import { computed, ref, type CSSProperties } from 'vue'
import './Folder.css'

const props = withDefaults(
  defineProps<{
    color?: string
    size?: number
    ariaLabel?: string
  }>(),
  {
    color: '#5227FF',
    size: 1,
    ariaLabel: undefined,
  },
)

const emit = defineEmits<{
  activate: []
}>()

const darkenColor = (hex: string, percent: number) => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex
  if (color.length === 3) {
    color = color
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = parseInt(color.slice(0, 6), 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))))
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))))
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))))
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

const maxItems = 3

const open = ref(false)
const paperOffsets = ref<{ x: number; y: number }[]>(
  Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })),
)

const folderBackColor = computed(() => darkenColor(props.color, 0.08))
const paper1 = computed(() => darkenColor('#ffffff', 0.1))
const paper2 = computed(() => darkenColor('#ffffff', 0.05))
const paper3 = '#ffffff'

const folderStyle = computed(
  () =>
    ({
      '--folder-color': props.color,
      '--folder-back-color': folderBackColor.value,
      '--paper-1': paper1.value,
      '--paper-2': paper2.value,
      '--paper-3': paper3,
    }) as CSSProperties,
)

const folderClassName = computed(() => `folder ${open.value ? 'open' : ''}`.trim())
const scaleStyle = computed(() => ({ transform: `scale(${props.size})` }))
const computedAriaLabel = computed(
  () => props.ariaLabel ?? (open.value ? '关闭文件夹' : '打开文件夹'),
)

function handleClick() {
  open.value = !open.value
  if (!open.value) {
    paperOffsets.value = Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
  }
  emit('activate')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleClick()
  }
}

function handlePaperMouseMove(e: MouseEvent, index: number) {
  if (!open.value) return
  const target = e.currentTarget as HTMLDivElement
  const rect = target.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const offsetX = (e.clientX - centerX) * 0.15
  const offsetY = (e.clientY - centerY) * 0.15
  paperOffsets.value = paperOffsets.value.map((offset, i) =>
    i === index ? { x: offsetX, y: offsetY } : offset,
  )
}

function handlePaperMouseLeave(index: number) {
  paperOffsets.value = paperOffsets.value.map((offset, i) => (i === index ? { x: 0, y: 0 } : offset))
}

function paperStyle(index: number): CSSProperties {
  if (!open.value) return {}
  return {
    '--magnet-x': `${paperOffsets.value[index]?.x || 0}px`,
    '--magnet-y': `${paperOffsets.value[index]?.y || 0}px`,
  } as CSSProperties
}
</script>

<template>
  <div :style="scaleStyle">
    <div
      :class="folderClassName"
      :style="folderStyle"
      tabindex="0"
      role="button"
      :aria-expanded="open"
      :aria-label="computedAriaLabel"
      @click="handleClick"
      @keydown="handleKeydown"
    >
      <div class="folder__back">
        <div
          v-for="i in maxItems"
          :key="i"
          :class="`paper paper-${i}`"
          :style="paperStyle(i - 1)"
          @mousemove="(e) => handlePaperMouseMove(e, i - 1)"
          @mouseleave="handlePaperMouseLeave(i - 1)"
        />
        <div class="folder__front"></div>
        <div class="folder__front right"></div>
      </div>
    </div>
  </div>
</template>

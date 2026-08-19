<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Folder from './Folder.vue'

// ----------------------------------------------------------------------
// Transition Physics
// ----------------------------------------------------------------------
const SPRING_TRANSITION =
  'max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
const SMOOTH_HEIGHT_TRANSITION = 'max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.15s ease-out'

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
interface Attachment {
  id: string
  file: File
  url: string
  name: string
  width?: number
  height?: number
}

const props = withDefaults(
  defineProps<{
    placeholder?: string
    models?: string[]
    efforts?: string[]
    defaultValue?: string
    modelValue?: string
    maxAttachments?: number
    folderColor?: string
  }>(),
  {
    placeholder: 'Ask anything',
    models: () => ['GPT 5.5', 'Opus 4.8', 'Gemini 3.5 Flash', 'Composer 2.5', 'GLM 5.2'],
    efforts: () => ['Low', 'Medium', 'Max Effort'],
    defaultValue: '',
    modelValue: undefined,
    maxAttachments: 6,
    folderColor: '#5227FF',
  },
)

const emit = defineEmits<{
  submit: [value: string, meta: { model: string; effort: string; attachments: File[] }]
  'update:modelValue': [value: string]
}>()

// ----------------------------------------------------------------------
// Icons data (kept as small inline render helpers via computed paths)
// ----------------------------------------------------------------------
const MODEL_ICONS: Record<string, string> = {
  'Composer 2.5': 'https://res.cloudinary.com/drhx7imeb/image/upload/v1781695268/cursor-ai-code-icon_j4vnux.svg',
  'Gemini 3.5 Flash':
    'https://res.cloudinary.com/drhx7imeb/image/upload/v1781695268/google-gemini-icon_l6kk5q.svg',
  'GPT 5.5': 'https://res.cloudinary.com/drhx7imeb/image/upload/v1781695269/openai-icon_zozuib.svg',
  'Opus 4.8': 'https://res.cloudinary.com/drhx7imeb/image/upload/v1781695268/Claude_AI_symbol_yqfzlc.svg',
  'GLM 5.2': 'https://res.cloudinary.com/drhx7imeb/image/upload/v1781695269/z-ai-icon_xi4xvo.svg',
}
const MODEL_ICON_FILTERS: Record<string, string> = {
  'GPT 5.5': 'dark:invert',
}
function modelIconSrc(model: string) {
  return MODEL_ICONS[model] || MODEL_ICONS['GPT 5.5']
}
function modelIconFilter(model: string) {
  return MODEL_ICON_FILTERS[model] || ''
}

// ----------------------------------------------------------------------
// State
// ----------------------------------------------------------------------
const expanded = ref(false)
const isSmoothResize = ref(false)
const localValue = ref(props.defaultValue)
const selectedModel = ref(props.models[0])
const effortIndex = ref(1)
const isModelSelectOpen = ref(false)

const attachments = ref<Attachment[]>([])
const activeAttachment = ref<{ attachment: Attachment; rect: DOMRect } | null>(null)

// Audio/Voice recording state
const isRecording = ref(false)
const audioData = ref<number[]>(new Array(5).fill(0))

// Refs for Web Audio & Speech Recognition cleanup
let streamRef: MediaStream | null = null
let audioContextRef: AudioContext | null = null
let rafRef: number | null = null
let recognitionRef: any = null
let demoIntervalRef: number | null = null
let demoTextIntervalRef: number | null = null

const hoverStyle = ref({
  opacity: 0,
  transform: 'translateY(0px) scale(0.95)',
  transition: 'none',
})
const containerHeight = ref(116)
const textareaHeight = ref(68)
const isScrolling = ref(false)

const isControlled = props.modelValue !== undefined
const value = computed(() => (isControlled ? props.modelValue! : localValue.value))
const hasValue = computed(() => value.value.trim() !== '' || attachments.value.length > 0)
const hasAttachments = computed(() => attachments.value.length > 0)

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const internalContainerRef = ref<HTMLDivElement | null>(null)
const topFadeRef = ref<HTMLDivElement | null>(null)
const bottomFadeRef = ref<HTMLDivElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const thumbRefs = new Map<string, HTMLButtonElement | null>()

// Keep a plain mirror of `value` for closures (speech recognition callbacks).
let valueMirror = value.value
watch(value, (v) => {
  valueMirror = v
})

const attachDisabled = computed(() => attachments.value.length >= props.maxAttachments)
const showArrow = computed(() => hasValue.value && !isRecording.value)
const showStop = computed(() => isRecording.value)
const showMic = computed(() => !hasValue.value && !isRecording.value)

function updateFades() {
  const el = textareaRef.value
  if (!el) return
  const { scrollTop, scrollHeight, clientHeight } = el
  if (topFadeRef.value) {
    topFadeRef.value.style.opacity = Math.min(scrollTop / 20, 1).toString()
  }
  if (bottomFadeRef.value) {
    const bottomScroll = scrollHeight - clientHeight - scrollTop
    bottomFadeRef.value.style.opacity = Math.min(Math.max(bottomScroll - 16, 0) / 10, 1).toString()
  }
}

function handleValueChange(val: string) {
  isSmoothResize.value = true
  if (!isControlled) localValue.value = val
  emit('update:modelValue', val)
}

function expand() {
  isSmoothResize.value = false
  expanded.value = true
}

// --- Voice Recording Logic ---
function stopRecording() {
  if (recognitionRef) {
    recognitionRef.stop()
    recognitionRef = null
  }
  if (rafRef) {
    cancelAnimationFrame(rafRef)
    rafRef = null
  }
  if (streamRef) {
    streamRef.getTracks().forEach((track) => track.stop())
    streamRef = null
  }
  if (audioContextRef) {
    audioContextRef.close()
    audioContextRef = null
  }
  if (demoIntervalRef) {
    window.clearInterval(demoIntervalRef)
    demoIntervalRef = null
  }
  if (demoTextIntervalRef) {
    window.clearInterval(demoTextIntervalRef)
    demoTextIntervalRef = null
  }
  isRecording.value = false
  audioData.value = new Array(5).fill(0)
}

async function startRecording() {
  isSmoothResize.value = false
  expanded.value = true

  let stream: MediaStream | null = null
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    }
  } catch {
    console.warn('Microphone access denied or unavailable. Falling back to simulated voice mode for demo.')
  }

  isRecording.value = true

  function simulateText() {
    const fakeText = '帮我描述一下这个磁体球在光线下的质感与流动'
    const words = fakeText.split('')
    let i = 0
    let currentBase = valueMirror
    demoTextIntervalRef = window.setInterval(() => {
      if (i < words.length) {
        currentBase = currentBase + words[i]
        handleValueChange(currentBase)
        i++
      } else {
        stopRecording()
      }
    }, 120)
  }

  if (stream) {
    streamRef = stream

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    const audioCtx = new AudioCtx()
    audioContextRef = audioCtx

    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 64
    const source = audioCtx.createMediaStreamSource(stream)
    source.connect(analyser)

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const updateVisualizer = () => {
      analyser.getByteFrequencyData(dataArray)
      const bands = new Array(5).fill(0)
      const step = Math.floor(dataArray.length / 5)
      for (let i = 0; i < 5; i++) {
        let sum = 0
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j]
        }
        bands[i] = sum / step / 255
      }
      audioData.value = bands
      rafRef = requestAnimationFrame(updateVisualizer)
    }
    updateVisualizer()

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'zh-CN'

      let baseline = valueMirror

      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        if (finalTranscript) {
          baseline += finalTranscript
        }

        handleValueChange((baseline + interimTranscript).trim())
      }

      recognition.onerror = (e: any) => {
        console.error('Speech recognition error', e)
        stopRecording()
      }

      recognition.onend = () => {
        stopRecording()
      }

      recognitionRef = recognition
      recognition.start()
    } else {
      console.warn('Speech Recognition API not supported in this browser. Using simulated text.')
      simulateText()
    }
  } else {
    demoIntervalRef = window.setInterval(() => {
      audioData.value = Array.from({ length: 5 }, () => Math.random() * 0.8 + 0.1)
    }, 100)
    simulateText()
  }
}

// Keep textarea auto-scrolled to bottom while recording
watch([value, isRecording], () => {
  if (isRecording.value && textareaRef.value) {
    textareaRef.value.scrollTop = textareaRef.value.scrollHeight
  }
})

watch([value, hasAttachments], () => {
  if ((value.value.trim() !== '' || hasAttachments.value) && !expanded.value) {
    isSmoothResize.value = false
    expanded.value = true
  }
})

watch([expanded, isRecording], () => {
  if (expanded.value && !isRecording.value) {
    setTimeout(() => {
      if (textareaRef.value) {
        textareaRef.value.focus()
        const length = textareaRef.value.value.length
        textareaRef.value.setSelectionRange(length, length)
      }
    }, 50)
  }
})

// ONLY updates height on value/text change. Adding attachments leaves this completely isolated.
watch([value, expanded], () => {
  nextTick(() => {
    const el = textareaRef.value
    if (!el) return

    const currentHeight = el.style.height
    el.style.transition = 'none'
    el.style.height = '0px'
    const scrollHeight = el.scrollHeight
    el.style.height = currentHeight
    void el.offsetHeight
    el.style.transition = ''

    const newHeight = Math.max(68, Math.min(scrollHeight, 160))
    el.style.height = `${newHeight}px`

    textareaHeight.value = newHeight
    isScrolling.value = scrollHeight > 160

    setTimeout(updateFades, 0)
  })
})

watch(textareaHeight, (h) => {
  containerHeight.value = Math.max(116, h + 48)
  setTimeout(updateFades, 0)
})

function handleOutsideClick(e: MouseEvent) {
  if (internalContainerRef.value && !internalContainerRef.value.contains(e.target as Node)) {
    isModelSelectOpen.value = false
  }
}

watch(isModelSelectOpen, (open) => {
  if (open) {
    document.addEventListener('mousedown', handleOutsideClick)
  } else {
    document.removeEventListener('mousedown', handleOutsideClick)
  }
})

function handleBlur(e: FocusEvent) {
  if (
    internalContainerRef.value &&
    e.relatedTarget &&
    internalContainerRef.value.contains(e.relatedTarget as Node)
  )
    return
  if (value.value.trim() === '' && !hasAttachments.value && !isRecording.value) {
    isSmoothResize.value = false
    expanded.value = false
    isModelSelectOpen.value = false
  }
}

function handleSubmit() {
  if (value.value.trim() === '' && !hasAttachments.value) return
  isSmoothResize.value = false
  emit('submit', value.value, {
    model: selectedModel.value,
    effort: props.efforts[effortIndex.value],
    attachments: attachments.value.map((a) => a.file),
  })
  handleValueChange('')
  attachments.value.forEach((a) => URL.revokeObjectURL(a.url))
  attachments.value = []
  expanded.value = false
  isModelSelectOpen.value = false
}

function cycleEffort(e: MouseEvent) {
  e.stopPropagation()
  effortIndex.value = (effortIndex.value + 1) % props.efforts.length
}

function openFileChooser(e?: MouseEvent) {
  e?.stopPropagation()
  fileInputRef.value?.click()
}

function addAttachment(file: File, url: string, width: number, height: number) {
  const id = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`
  attachments.value = [...attachments.value, { id, file, url, name: file.name, width, height }]
}

async function handleFilesChosen(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? []).filter((f) => f.type.startsWith('image/'))
  input.value = ''

  if (files.length === 0) return
  const room = Math.max(0, props.maxAttachments - attachments.value.length)
  const accepted = files.slice(0, room)

  if (!expanded.value) {
    isSmoothResize.value = false
    expanded.value = true
  } else {
    isSmoothResize.value = true
  }

  for (const file of accepted) {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => addAttachment(file, url, img.naturalWidth, img.naturalHeight)
    img.onerror = () => addAttachment(file, url, 800, 600)
    img.src = url
  }
}

function removeAttachment(id: string) {
  isSmoothResize.value = true
  const target = attachments.value.find((a) => a.id === id)
  if (target) URL.revokeObjectURL(target.url)
  attachments.value = attachments.value.filter((a) => a.id !== id)
  thumbRefs.delete(id)
}

function onActionButtonClick(e: MouseEvent) {
  e.preventDefault()
  if (isRecording.value) {
    stopRecording()
  } else if (hasValue.value) {
    handleSubmit()
  } else {
    startRecording()
  }
}

function handleTextareaKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && (e as unknown as { keyCode?: number }).keyCode !== 229) {
    e.preventDefault()
    handleSubmit()
  }
  if (e.key === 'Escape' && value.value.trim() === '' && !hasAttachments.value) {
    isSmoothResize.value = false
    expanded.value = false
    isModelSelectOpen.value = false
  }
}

function handleCardMouseDown(e: MouseEvent) {
  const isTextarea = e.target === textareaRef.value
  if (expanded.value && !isTextarea && !isRecording.value) {
    e.preventDefault()
    textareaRef.value?.focus()
  }
}

function handleModelHover(idx: number) {
  hoverStyle.value = {
    opacity: 1,
    transform: `translateY(${idx * 34}px) scale(1)`,
    transition:
      hoverStyle.value.opacity === 0
        ? 'opacity 0.15s ease-out'
        : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.15s ease',
  }
}

function handleModelSelectMouseLeave() {
  hoverStyle.value = {
    ...hoverStyle.value,
    opacity: 0,
    transform: hoverStyle.value.transform.replace('scale(1)', 'scale(0.95)'),
    transition: 'opacity 0.2s ease-in, transform 0.2s ease-out',
  }
}

function selectModel(model: string) {
  selectedModel.value = model
  isModelSelectOpen.value = false
}

function openAttachmentPreview(attachment: Attachment, el: HTMLButtonElement | null) {
  if (!el) return
  activeAttachment.value = { attachment, rect: el.getBoundingClientRect() }
}

// ----------------------------------------------------------------------
// Attachment thumb hover state (per-item)
// ----------------------------------------------------------------------
const hoveredThumbId = ref<string | null>(null)

// ----------------------------------------------------------------------
// Gallery modal (FLIP-style open/close)
// ----------------------------------------------------------------------
const galleryPhase = ref<'opening' | 'open' | 'closing'>('opening')
const galleryTargetRect = ref<{ top: number; left: number; width: number; height: number; radius: number } | null>(
  null,
)
let galleryRaf: number | null = null

watch(activeAttachment, (val) => {
  if (!val) return
  galleryPhase.value = 'opening'
  galleryTargetRect.value = null

  const maxW = Math.min(window.innerWidth * 0.86, 560)
  const maxH = Math.min(window.innerHeight * 0.78, 720)

  const naturalW = val.attachment.width || 800
  const naturalH = val.attachment.height || 600
  const scale = Math.min(maxW / naturalW, maxH / naturalH, 1.6)

  const width = naturalW * scale
  const height = naturalH * scale

  galleryTargetRect.value = {
    top: (window.innerHeight - height) / 2,
    left: (window.innerWidth - width) / 2,
    width,
    height,
    radius: 20,
  }

  if (galleryRaf) cancelAnimationFrame(galleryRaf)
  galleryRaf = requestAnimationFrame(() => {
    galleryPhase.value = 'open'
  })
})

function closeGallery() {
  galleryPhase.value = 'closing'
}

function onGalleryTransitionEnd() {
  if (galleryPhase.value === 'closing') {
    activeAttachment.value = null
  }
}

function handleGalleryKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && activeAttachment.value) closeGallery()
}

const galleryGeometry = computed(() => {
  if (!activeAttachment.value) return null
  const isOpen = galleryPhase.value === 'open'
  if (isOpen && galleryTargetRect.value) return galleryTargetRect.value
  const rect = activeAttachment.value.rect
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height, radius: 12 }
})

const galleryFlipTransition = computed(() => {
  const isClosing = galleryPhase.value === 'closing'
  const easing = isClosing ? 'ease-out' : 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  const dur = isClosing ? '0.3s' : '0.45s'
  return `top ${dur} ${easing}, left ${dur} ${easing}, width ${dur} ${easing}, height ${dur} ${easing}, border-radius ${dur} ${easing}`
})

onMounted(() => {
  document.addEventListener('keydown', handleGalleryKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGalleryKeydown)
  document.removeEventListener('mousedown', handleOutsideClick)
  stopRecording()
  attachments.value.forEach((a) => URL.revokeObjectURL(a.url))
})
</script>

<template>
  <div
    ref="internalContainerRef"
    class="relative flex w-full flex-col"
    :style="{
      maxWidth: expanded ? '480px' : '320px',
      transition: isSmoothResize ? 'max-width 0.15s ease-out' : 'max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }"
    @focusout="handleBlur"
  >
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      tabindex="-1"
      aria-hidden="true"
      @change="handleFilesChosen"
    />

    <!-- Independent Attachment Tab (Slides up from behind the prompt input) -->
    <div
      :aria-hidden="!hasAttachments"
      class="relative z-0 w-full overflow-hidden"
      :style="{
        height: hasAttachments && expanded ? '68px' : '0px',
        transition: isSmoothResize ? 'height 0.15s ease-out' : 'height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }"
    >
      <div
        class="prompt-scrollbar flex items-start gap-2 overflow-x-auto rounded-t-2xl border border-b-0 border-border bg-muted px-2 pt-2 pb-1"
        :style="{
          position: 'absolute',
          bottom: '-8px',
          left: '20px',
          right: '20px',
          height: '68px',
          transform: hasAttachments && expanded ? 'translateY(0)' : 'translateY(100%)',
          opacity: hasAttachments && expanded ? 1 : 0,
          transition: isSmoothResize
            ? 'transform 0.15s ease-out, opacity 0.15s ease-out'
            : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease-out',
        }"
      >
        <button
          v-for="(attachment, index) in attachments"
          :key="attachment.id"
          type="button"
          :ref="(el) => thumbRefs.set(attachment.id, el as HTMLButtonElement | null)"
          class="group relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted outline-none transition-transform duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-[1.04] active:scale-[0.96] animate-in fade-in slide-in-from-top-3 zoom-in-90 duration-400"
          :style="{ animationDelay: `${index * 35}ms`, animationFillMode: 'backwards' }"
          :aria-label="`打开预览 ${attachment.name}`"
          @mousedown.prevent
          @mouseenter="hoveredThumbId = attachment.id"
          @mouseleave="hoveredThumbId = null"
          @click.stop="openAttachmentPreview(attachment, thumbRefs.get(attachment.id) ?? null)"
        >
          <img :src="attachment.url" :alt="attachment.name" class="size-full object-cover" draggable="false" />
          <span
            class="absolute inset-0 flex items-start justify-end bg-black/0 transition-colors duration-200"
            :class="hoveredThumbId === attachment.id && 'bg-black/25'"
          >
            <span
              role="button"
              tabindex="-1"
              class="m-1 flex size-4 items-center justify-center rounded-full bg-background/90 text-foreground/70 shadow-sm transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:bg-background hover:text-foreground hover:scale-110"
              :class="
                hoveredThumbId === attachment.id
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-50 pointer-events-none'
              "
              :aria-label="`移除 ${attachment.name}`"
              @mousedown.prevent.stop
              @click.stop="removeAttachment(attachment.id)"
            >
              <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </span>
          </span>
        </button>
      </div>
    </div>

    <!-- Main Input Card -->
    <div
      class="relative z-10 w-full border border-border bg-card shadow-sm focus-within:border-ring/40 focus-within:ring-1 focus-within:ring-ring/20 hover:border-border/80"
      :class="expanded ? 'cursor-text' : 'cursor-default'"
      :style="{
        borderRadius: '24px',
        height: expanded ? `${containerHeight}px` : '48px',
        transition: isSmoothResize ? SMOOTH_HEIGHT_TRANSITION : SPRING_TRANSITION,
        overflow: expanded ? 'visible' : 'hidden',
      }"
      @mousedown="handleCardMouseDown"
    >
      <textarea
        ref="textareaRef"
        :value="value"
        :placeholder="placeholder"
        aria-label="Prompt"
        :disabled="isRecording"
        class="prompt-scrollbar absolute inset-x-0 top-0 z-[1] w-full resize-none bg-transparent pl-4 pr-12 py-3.5 text-sm leading-[22px] text-foreground outline-none placeholder:font-medium placeholder:text-muted-foreground/80 cursor-text"
        :class="[
          expanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none',
          isScrolling ? 'overflow-y-auto' : 'overflow-y-hidden',
          isRecording && 'pointer-events-none',
        ]"
        :style="{
          transition: isSmoothResize
            ? 'height 0.15s ease-out'
            : 'opacity 0.3s ease-out, transform 0.3s ease-out, height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }"
        @input="handleValueChange(($event.target as HTMLTextAreaElement).value)"
        @scroll="updateFades"
        @keydown="handleTextareaKeydown"
      />

      <div
        ref="topFadeRef"
        class="pointer-events-none absolute left-4 right-12 top-0 z-[2] h-8 bg-gradient-to-b from-card via-card/90 to-transparent"
      />
      <div
        ref="bottomFadeRef"
        class="pointer-events-none absolute left-4 right-12 z-[2] h-8 bg-gradient-to-t from-card via-card/90 to-transparent"
        :style="{
          opacity: 0,
          top: `${textareaHeight - 32}px`,
          transition: isSmoothResize ? 'top 0.15s ease-out' : 'top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }"
      />

      <button
        type="button"
        class="absolute inset-x-0 top-0 z-[1] cursor-text pl-4 pr-12 py-[15px] text-left text-sm font-medium leading-[17px] text-muted-foreground/80 outline-none"
        :class="
          !expanded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-105 translate-y-1 pointer-events-none'
        "
        :style="{ transition: isSmoothResize ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }"
        aria-label="Open prompt input"
        @click="expand"
      >
        {{ placeholder }}
      </button>

      <!-- Bottom Actions Wrapper - Hides when recording to make space for visualizer -->
      <div
        class="absolute bottom-2 left-3 right-12 z-[10] flex items-center gap-0 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
        :class="
          expanded && !isRecording
            ? 'opacity-100 blur-0 translate-y-0 pointer-events-auto'
            : 'opacity-0 blur-sm translate-y-2 pointer-events-none'
        "
      >
        <div class="relative">
          <button
            type="button"
            class="group flex items-center gap-1 rounded-full px-2 py-1 text-foreground/50 transition-all duration-200 outline-none hover:bg-accent/60 hover:text-foreground cursor-default"
            :class="isModelSelectOpen ? 'bg-accent/60 text-foreground' : ''"
            :aria-label="`选择模型，当前：${selectedModel}`"
            @mousedown.prevent
            @click.stop="isModelSelectOpen = !isModelSelectOpen"
          >
            <img
              :src="modelIconSrc(selectedModel)"
              :alt="selectedModel"
              :class="['size-3.5 object-contain opacity-70 group-hover:opacity-100 transition-opacity', modelIconFilter(selectedModel)]"
            />
            <span class="text-xs font-semibold select-none transition-colors">{{ selectedModel }}</span>
          </button>

          <div
            class="absolute bottom-full left-0 mb-2.5 z-50 flex w-44 flex-col gap-0.5 rounded-2xl border border-border bg-card/95 p-1 shadow-xl backdrop-blur-md transition-all duration-400 cursor-default"
            :class="
              isModelSelectOpen
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto ease-[cubic-bezier(0.34,1.56,0.64,1)]'
                : 'opacity-0 scale-95 translate-y-3 pointer-events-none ease-[cubic-bezier(0.175,0.885,0.32,1.275)]'
            "
            style="transform-origin: bottom left"
            @mouseleave="handleModelSelectMouseLeave"
          >
            <div class="relative flex flex-col gap-0.5">
              <div
                class="pointer-events-none absolute left-0 right-0 top-0 -z-10 h-8 rounded-xl bg-accent"
                :style="hoverStyle"
              />
              <button
                v-for="(model, idx) in models"
                :key="model"
                type="button"
                class="group relative flex h-8 w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-foreground/80 outline-none active:scale-[0.98] cursor-default"
                @mousedown.prevent
                @mouseenter="handleModelHover(idx)"
                @click.stop="selectModel(model)"
              >
                <span class="flex items-center gap-2">
                  <img
                    :src="modelIconSrc(model)"
                    :alt="model"
                    :class="['size-3.5 object-contain opacity-85 group-hover:opacity-100 transition-opacity', modelIconFilter(model)]"
                  />
                  {{ model }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="group flex items-center gap-1 rounded-full px-2 py-1 text-foreground/50 transition-all duration-200 hover:bg-accent/60 hover:text-foreground outline-none cursor-default"
          @mousedown.prevent
          @click="cycleEffort"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1.5" y="8" width="2.5" height="4.5" rx="1" fill="currentColor" class="transition-opacity duration-300" :opacity="1" />
            <rect
              x="5.75"
              y="5"
              width="2.5"
              height="7.5"
              rx="1"
              fill="currentColor"
              class="transition-opacity duration-300"
              :opacity="efforts[effortIndex] === 'Medium' || efforts[effortIndex] === 'Max Effort' || efforts[effortIndex] === '均衡' || efforts[effortIndex] === '全力' ? 1 : 0.3"
            />
            <rect
              x="10"
              y="2"
              width="2.5"
              height="10.5"
              rx="1"
              fill="currentColor"
              class="transition-opacity duration-300"
              :opacity="efforts[effortIndex] === 'Max Effort' || efforts[effortIndex] === '全力' ? 1 : 0.3"
            />
          </svg>
          <span class="text-xs font-semibold select-none transition-colors">{{ efforts[effortIndex] }}</span>
        </button>

        <!-- Folder upload button (replaces the plain "+" attach button) -->
        <div
          class="relative ml-auto flex size-7 items-center justify-center transition-opacity duration-200"
          :class="attachDisabled && 'opacity-40 pointer-events-none'"
        >
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" @mousedown.prevent>
            <Folder :color="folderColor" :size="0.28" aria-label="上传图片附件" @activate="openFileChooser()" />
          </div>
        </div>
      </div>

      <!-- Audio Wave Visualizer Overlay positioned precisely to the left of the mic button -->
      <div
        class="absolute right-12 bottom-2 z-[10] flex h-8 items-center justify-end gap-[3px] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
        :class="isRecording ? 'w-16 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-4 pointer-events-none'"
      >
        <div
          v-for="(val, i) in audioData"
          :key="i"
          class="w-1 rounded-full bg-primary transition-[height] duration-75 ease-out"
          :style="{ height: `${Math.max(4, val * 24)}px` }"
        />
      </div>

      <button
        type="button"
        class="absolute right-2 bottom-2 z-[10] flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground transition-all duration-300 hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-default"
        style="border-radius: 9999px"
        :aria-label="showArrow ? '发送' : showStop ? '停止录音' : '语音输入'"
        @mousedown.prevent.stop
        @click="onActionButtonClick"
      >
        <span class="relative flex h-full w-full items-center justify-center">
          <span
            class="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
            :class="
              showArrow ? 'opacity-100 scale-100 rotate-0 blur-none' : 'opacity-0 scale-50 rotate-45 blur-[1px] pointer-events-none'
            "
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span
            class="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
            :class="
              showMic ? 'opacity-100 scale-100 rotate-0 blur-none' : 'opacity-0 scale-50 -rotate-45 blur-[1px] pointer-events-none'
            "
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="5" y="1" width="4" height="7" rx="2" stroke="currentColor" stroke-width="1.5" />
              <path
                d="M2.75 6.5V7a4.25 4.25 0 0 0 8.5 0v-.5M7 11.25V13"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span
            class="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
            :class="
              showStop ? 'opacity-100 scale-100 rotate-0 blur-none' : 'opacity-0 scale-50 rotate-45 blur-[1px] pointer-events-none'
            "
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="currentColor" />
            </svg>
          </span>
        </span>
      </button>
    </div>
  </div>

  <!-- Shared-Element Gallery Modal -->
  <Teleport to="body">
    <div
      v-if="activeAttachment && galleryGeometry"
      class="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      @click="closeGallery"
    >
      <div
        class="absolute inset-0 bg-background/70 backdrop-blur-md transition-opacity duration-400"
        :style="{ opacity: galleryPhase === 'open' ? 1 : 0 }"
      />
      <div
        class="bg-muted"
        :style="{
          position: 'fixed',
          top: `${galleryGeometry.top}px`,
          left: `${galleryGeometry.left}px`,
          width: `${galleryGeometry.width}px`,
          height: `${galleryGeometry.height}px`,
          borderRadius: `${galleryGeometry.radius}px`,
          transition: galleryFlipTransition,
          overflow: 'hidden',
          boxShadow: galleryPhase === 'open' ? '0 24px 60px -12px rgb(0 0 0 / 0.35)' : '0 0px 0px 0px rgb(0 0 0 / 0)',
        }"
        @click.stop
        @transitionend="onGalleryTransitionEnd"
      >
        <img
          :src="activeAttachment.attachment.url"
          :alt="activeAttachment.attachment.name"
          class="size-full object-cover"
          draggable="false"
        />
      </div>

      <button
        type="button"
        class="fixed right-4 top-4 flex size-9 items-center justify-center rounded-full bg-card/90 text-foreground/70 shadow-md backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:bg-card hover:text-foreground"
        :class="galleryPhase !== 'open' && 'pointer-events-none'"
        :style="{
          opacity: galleryPhase === 'open' ? 1 : 0,
          transform: galleryPhase === 'open' ? 'scale(1)' : 'scale(0.7)',
        }"
        @click="closeGallery"
      >
        <span class="scale-150">
          <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </span>
      </button>
    </div>
  </Teleport>
</template>

<style>
.prompt-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  background: transparent;
}
.prompt-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.prompt-scrollbar::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
}
.prompt-scrollbar:hover::-webkit-scrollbar-thumb {
  background: color-mix(in oklch, var(--muted-foreground) 30%, transparent);
}
</style>

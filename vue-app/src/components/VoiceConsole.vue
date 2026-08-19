<script setup lang="ts">
import { ref } from 'vue'
import { Mic, MicOff, Paperclip, Send, X, MessageSquareText } from 'lucide-vue-next'
import type { OrbMode, TextEntry } from '../composables/useVoiceOrb'

const props = defineProps<{
  mode: OrbMode
  micOn: boolean
  micError: string | null
  latestEntry: TextEntry | null
}>()

const emit = defineEmits<{
  toggleMic: []
  speak: [text: string, attachments?: string[]]
}>()

const STATUS_LABEL: Record<OrbMode, string> = {
  idle: '待机中 · 静候声音',
  listening: '聆听中 · 麦克风已开启',
  thinking: '正在感应…',
  speaking: '正在发声',
}

const value = ref('')
const files = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

function submit() {
  if (!value.value.trim()) return
  emit('speak', value.value, files.value.map((f) => f.name))
  value.value = ''
  files.value = []
  if (fileInput.value) fileInput.value.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter') return
  // Guard against IME composition (Chinese/Japanese/Korean) confirming on Enter,
  // and Safari's unreliable final composition event (keyCode 229).
  if (e.isComposing || (e as unknown as { keyCode?: number }).keyCode === 229) return
  e.preventDefault()
  submit()
}

function handleFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const selected = Array.from(input.files ?? [])
  if (selected.length) files.value = [...files.value, ...selected]
}

function removeFile(index: number) {
  files.value = files.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-4 pb-6 sm:pb-10">
    <!-- Persistent answer card: stays put next to the orb and only ever
         swaps to the newest entry -- it never auto-dismisses on a timer. -->
    <div
      v-if="props.latestEntry"
      class="pointer-events-auto flex w-full max-w-xl flex-col gap-1.5 rounded-2xl border border-border bg-card/95 px-4 py-3 text-left shadow-xl shadow-black/10 backdrop-blur-xl"
    >
      <div class="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
        <MessageSquareText class="size-3" />
        最新内容
      </div>
      <p class="font-sans text-sm leading-relaxed text-foreground">{{ props.latestEntry.text }}</p>
      <div v-if="props.latestEntry.attachments?.length" class="flex flex-wrap gap-1.5 pt-0.5">
        <span
          v-for="name in props.latestEntry.attachments"
          :key="name"
          class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] text-secondary-foreground"
        >
          <Paperclip class="size-3" />
          {{ name }}
        </span>
      </div>
    </div>

    <div
      class="pointer-events-none flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 font-mono text-xs tracking-wide text-muted-foreground backdrop-blur-md transition-colors"
      :class="{
        'text-accent': props.mode === 'listening',
        'text-primary': props.mode === 'speaking' || props.mode === 'thinking',
      }"
    >
      <span
        class="size-1.5 rounded-full bg-muted-foreground/60"
        :class="{
          'bg-accent animate-pulse': props.mode === 'listening',
          'bg-primary animate-pulse': props.mode === 'speaking' || props.mode === 'thinking',
        }"
      />
      {{ STATUS_LABEL[props.mode] }}
    </div>

    <div
      class="pointer-events-auto flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-2xl shadow-black/10 backdrop-blur-xl"
    >
      <div v-if="files.length" class="flex flex-wrap gap-1.5 px-1.5 pt-1">
        <span
          v-for="(file, index) in files"
          :key="`${file.name}-${index}`"
          class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 font-mono text-[11px] text-secondary-foreground"
        >
          <Paperclip class="size-3" />
          {{ file.name }}
          <button
            type="button"
            class="ml-0.5 rounded-full text-muted-foreground hover:text-foreground"
            :aria-label="`移除附件 ${file.name}`"
            @click="removeFile(index)"
          >
            <X class="size-3" />
          </button>
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors"
          :class="
            props.micOn
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-transparent text-foreground hover:bg-secondary/50'
          "
          :aria-pressed="props.micOn"
          :aria-label="props.micOn ? '关闭麦克风' : '开启麦克风'"
          @click="emit('toggleMic')"
        >
          <Mic v-if="props.micOn" class="size-4" />
          <MicOff v-else class="size-4" />
        </button>

        <button
          type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-transparent text-foreground transition-colors hover:bg-secondary/50"
          aria-label="上传文件"
          @click="fileInput?.click()"
        >
          <Paperclip class="size-4" />
        </button>
        <input
          ref="fileInput"
          type="file"
          multiple
          class="hidden"
          aria-hidden="true"
          tabindex="-1"
          @change="handleFilesSelected"
        />

        <input
          v-model="value"
          type="text"
          placeholder="输入文字，让磁体球开口说话…"
          aria-label="文字输入"
          class="h-9 flex-1 border-none bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          @keydown="handleKeydown"
        />

        <button
          type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          :disabled="!value.trim()"
          aria-label="发送"
          @click="submit"
        >
          <Send class="size-4" />
        </button>
      </div>
    </div>

    <p class="pointer-events-none h-4 text-center font-mono text-[11px] text-destructive" role="status">
      {{ micError ?? '' }}
    </p>
  </div>
</template>

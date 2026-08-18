<script setup lang="ts">
import { ref } from 'vue'
import { Mic, MicOff, Send } from 'lucide-vue-next'
import type { OrbMode } from '../composables/useVoiceOrb'

const props = defineProps<{
  mode: OrbMode
  micOn: boolean
  micError: string | null
}>()

const emit = defineEmits<{
  toggleMic: []
  speak: [text: string]
}>()

const STATUS_LABEL: Record<OrbMode, string> = {
  idle: '待机中 · 静候声音',
  listening: '聆听中 · 麦克风已开启',
  thinking: '正在感应…',
  speaking: '正在发声',
}

const value = ref('')

function submit() {
  if (!value.value.trim()) return
  emit('speak', value.value)
  value.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter') return
  // Guard against IME composition (Chinese/Japanese/Korean) confirming on Enter,
  // and Safari's unreliable final composition event (keyCode 229).
  if (e.isComposing || (e as unknown as { keyCode?: number }).keyCode === 229) return
  e.preventDefault()
  submit()
}
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-4 pb-6 sm:pb-10">
    <div
      class="pointer-events-none flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 font-mono text-xs tracking-wide text-muted-foreground backdrop-blur-md transition-colors"
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
      class="pointer-events-auto flex w-full max-w-xl items-center gap-2 rounded-2xl border border-border/60 bg-card/70 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
    >
      <button
        type="button"
        class="flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors"
        :class="
          props.micOn
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border/60 bg-transparent text-foreground hover:bg-secondary/50'
        "
        :aria-pressed="props.micOn"
        :aria-label="props.micOn ? '关闭麦克风' : '开启麦克风'"
        @click="emit('toggleMic')"
      >
        <Mic v-if="props.micOn" class="size-4" />
        <MicOff v-else class="size-4" />
      </button>

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

    <p class="pointer-events-none h-4 text-center font-mono text-[11px] text-destructive" role="status">
      {{ micError ?? '' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { Paperclip, MessageSquareText } from 'lucide-vue-next'
import PromptInput from './ui/PromptInput.vue'
import type { OrbMode, TextEntry } from '../composables/useVoiceOrb'

const props = defineProps<{
  mode: OrbMode
  latestEntry: TextEntry | null
}>()

const emit = defineEmits<{
  speak: [text: string, attachments?: string[]]
}>()

const STATUS_LABEL: Record<OrbMode, string> = {
  idle: '待机中 · 静候声音',
  listening: '聆听中 · 麦克风已开启',
  thinking: '正在感应…',
  speaking: '正在发声',
}

function handleSubmit(value: string, meta: { attachments: File[] }) {
  if (!value.trim() && meta.attachments.length === 0) return
  emit('speak', value, meta.attachments.map((f) => f.name))
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
      <div
        class="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase"
        :class="props.latestEntry.role === 'orb' ? 'text-primary' : 'text-muted-foreground'"
      >
        <MessageSquareText class="size-3" />
        {{ props.latestEntry.role === 'orb' ? '磁体回复' : '你的输入' }}
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

    <!-- New prompt input (replaces the old mic/attach/input console). Its
         built-in mic does speech-to-text and the Folder button uploads image
         attachments; on submit we hand the text + file names to the orb. -->
    <div class="pointer-events-auto flex w-full justify-center">
      <PromptInput
        placeholder="输入文字，让磁体球开口说话…"
        :efforts="['低', '均衡', '全力']"
        folder-color="#C2703A"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

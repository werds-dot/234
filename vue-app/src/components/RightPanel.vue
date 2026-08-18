<script setup lang="ts">
import { Brain, MessageSquareText } from 'lucide-vue-next'
import type { OrbMode, ProcessLogEntry, TextEntry } from '../composables/useVoiceOrb'

defineProps<{
  mode: OrbMode
  logs: ProcessLogEntry[]
  textHistory: TextEntry[]
}>()

function formatTime(at: number) {
  return new Date(at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex items-center gap-2 border-b border-border px-4 py-3">
      <Brain class="size-3.5 text-muted-foreground" />
      <h2 class="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">思考过程</h2>
      <span
        class="ml-auto size-1.5 rounded-full bg-muted-foreground/50"
        :class="mode !== 'idle' && 'animate-pulse bg-primary'"
      />
    </div>

    <div class="thin-scroll h-[42%] shrink-0 overflow-y-auto">
      <div class="flex flex-col gap-1.5 p-4">
        <p v-if="logs.length === 0" class="font-mono text-xs text-muted-foreground/60">等待输入…</p>
        <p
          v-for="entry in logs.slice().reverse()"
          :key="entry.id"
          class="font-mono text-[11px] leading-relaxed text-muted-foreground/80"
        >
          <span class="text-muted-foreground/40">{{ formatTime(entry.at) }}</span> {{ entry.text }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2 border-t border-b border-border px-4 py-3">
      <MessageSquareText class="size-3.5 text-muted-foreground" />
      <h2 class="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">文字输出</h2>
    </div>

    <div class="thin-scroll min-h-0 flex-1 overflow-y-auto">
      <div class="flex flex-col gap-2 p-4">
        <p v-if="textHistory.length === 0" class="font-mono text-xs text-muted-foreground/60">尚未提交任何文字</p>
        <div
          v-for="entry in textHistory.slice().reverse()"
          :key="entry.id"
          class="rounded-lg border border-border bg-secondary/70 p-2.5"
        >
          <p class="font-mono text-[10px] text-muted-foreground/70">{{ formatTime(entry.at) }}</p>
          <p class="mt-0.5 font-sans text-xs leading-relaxed text-foreground/90">{{ entry.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

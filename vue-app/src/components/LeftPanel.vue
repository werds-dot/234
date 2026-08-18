<script setup lang="ts">
import { ref } from 'vue'
import { Settings2, History, LayoutGrid, Sliders } from 'lucide-vue-next'
import type { TextEntry } from '../composables/useVoiceOrb'

defineProps<{ history: TextEntry[] }>()

const activeTab = ref<'workbench' | 'history' | 'settings'>('workbench')

function formatTime(at: number) {
  return new Date(at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="flex h-full flex-col gap-0">
    <div class="grid w-full grid-cols-3 border-b border-border/50">
      <button
        type="button"
        class="flex items-center justify-center gap-1.5 border-b-2 py-3 font-mono text-[11px] transition-colors"
        :class="activeTab === 'workbench' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'"
        @click="activeTab = 'workbench'"
      >
        <LayoutGrid class="size-3.5" />
        工作台
      </button>
      <button
        type="button"
        class="flex items-center justify-center gap-1.5 border-b-2 py-3 font-mono text-[11px] transition-colors"
        :class="activeTab === 'history' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'"
        @click="activeTab = 'history'"
      >
        <History class="size-3.5" />
        历史
      </button>
      <button
        type="button"
        class="flex items-center justify-center gap-1.5 border-b-2 py-3 font-mono text-[11px] transition-colors"
        :class="activeTab === 'settings' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'"
        @click="activeTab = 'settings'"
      >
        <Settings2 class="size-3.5" />
        设置
      </button>
    </div>

    <div v-if="activeTab === 'workbench'" class="flex-1 overflow-hidden p-4">
      <h2 class="mb-3 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">工作台</h2>
      <div class="flex flex-col gap-3">
        <div class="rounded-lg border border-border/50 bg-secondary/40 p-3">
          <p class="font-mono text-[11px] text-muted-foreground">当前会话</p>
          <p class="mt-1 font-sans text-sm text-foreground">液态磁体 · 声音交互</p>
        </div>
        <div class="rounded-lg border border-border/50 bg-secondary/40 p-3">
          <p class="font-mono text-[11px] text-muted-foreground">交互提示</p>
          <p class="mt-1 font-sans text-xs leading-relaxed text-muted-foreground">
            拖动球体可将其拉伸变形，松手后会弹性回弯。开启麦克风或输入文字都会让它随声音起伏。
          </p>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'history'" class="flex-1 overflow-hidden p-0">
      <h2 class="px-4 pt-4 pb-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">历史记录</h2>
      <div class="thin-scroll h-[calc(100%-2.5rem)] overflow-y-auto px-4">
        <div class="flex flex-col gap-2 pb-4">
          <p v-if="history.length === 0" class="font-mono text-xs text-muted-foreground/60">暂无历史记录</p>
          <div
            v-for="entry in history.slice().reverse()"
            :key="entry.id"
            class="rounded-lg border border-border/40 bg-secondary/30 p-2.5"
          >
            <p class="font-mono text-[10px] text-muted-foreground/70">{{ formatTime(entry.at) }}</p>
            <p class="mt-0.5 line-clamp-2 font-sans text-xs text-foreground/90">{{ entry.text }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 overflow-hidden p-4">
      <h2 class="mb-3 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">设置</h2>
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/40 p-3">
          <span class="flex items-center gap-2 font-sans text-xs text-foreground/90">
            <Sliders class="size-3.5 text-muted-foreground" />
            形变灵敏度
          </span>
          <span class="font-mono text-[11px] text-muted-foreground">标准</span>
        </div>
        <div class="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/40 p-3">
          <span class="font-sans text-xs text-foreground/90">语音语言</span>
          <span class="font-mono text-[11px] text-muted-foreground">自动检测</span>
        </div>
        <div class="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/40 p-3">
          <span class="font-sans text-xs text-foreground/90">深井视觉深度</span>
          <span class="font-mono text-[11px] text-muted-foreground">中</span>
        </div>
      </div>
    </div>
  </div>
</template>

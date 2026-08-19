<script setup lang="ts">
import { ref } from 'vue'
import {
  Settings2,
  History,
  LayoutGrid,
  Sliders,
  Paperclip,
  Sparkles,
  Palette,
  Upload,
  Wand2,
  Languages,
  Code2,
  PenLine,
  X,
} from 'lucide-vue-next'
import type { TextEntry } from '../composables/useVoiceOrb'
import { useBackgroundStore, PRESET_COLORS, type BackgroundMode } from '../composables/useBackgroundStore'

defineProps<{ history: TextEntry[] }>()

const activeTab = ref<'workbench' | 'history' | 'settings'>('workbench')

function formatTime(at: number) {
  return new Date(at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// --- Background settings (settings tab) -----------------------------------

const { pref, setMode, setColor, setImage } = useBackgroundStore()

const MODE_OPTIONS: { value: BackgroundMode; label: string }[] = [
  { value: 'fluid', label: '流体' },
  { value: 'solid', label: '纯色' },
  { value: 'image', label: '图片' },
]

const fileInputRef = ref<HTMLInputElement | null>(null)
const imageError = ref<string | null>(null)

function handleFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    imageError.value = '请选择图片文件'
    return
  }
  if (file.size > 4 * 1024 * 1024) {
    imageError.value = '图片需小于 4MB'
    return
  }
  imageError.value = null
  const reader = new FileReader()
  reader.onload = () => setImage(reader.result as string)
  reader.readAsDataURL(file)
}

// --- Skill plaza (workbench tab) -------------------------------------------

const SKILLS = [
  { icon: Wand2, name: '智能改写', desc: '一键优化语言表达与语气' },
  { icon: Languages, name: '实时翻译', desc: '多语言语音互译，即说即译' },
  { icon: Code2, name: '代码讲解', desc: '朗读并逐段解释代码片段' },
  { icon: PenLine, name: '写作教练', desc: '结构化长文写作与润色建议' },
]

const skillPlazaOpen = ref(false)

function openSkillPlaza() {
  skillPlazaOpen.value = true
}
function closeSkillPlaza() {
  skillPlazaOpen.value = false
}
function onDialogKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeSkillPlaza()
}
</script>

<template>
  <div class="flex h-full flex-col gap-0">
    <div class="grid w-full grid-cols-3 border-b border-border">
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
        <div class="rounded-lg border border-border bg-secondary/80 p-3">
          <p class="font-mono text-[11px] text-muted-foreground">当前会话</p>
          <p class="mt-1 font-sans text-sm text-foreground">液态磁体 · 声音交互</p>
        </div>
        <div class="rounded-lg border border-border bg-secondary/80 p-3">
          <p class="font-mono text-[11px] text-muted-foreground">交互提示</p>
          <p class="mt-1 font-sans text-xs leading-relaxed text-muted-foreground">
            拖动球体可将其拉伸变形，松手后会弹性回弯。开启麦克风或输入文字都会让它随声音起伏。
          </p>
        </div>

        <button
          type="button"
          class="group flex w-full items-center justify-between rounded-lg border border-border bg-secondary/80 p-3 text-left transition-colors hover:bg-secondary"
          @click="openSkillPlaza"
        >
          <span class="flex items-center gap-2">
            <Sparkles class="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
            <span class="font-sans text-xs text-foreground/90">技能广场</span>
          </span>
          <span
            class="inline-flex items-center rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-secondary-foreground"
          >
            {{ SKILLS.length }}
          </span>
        </button>
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
            class="rounded-lg border border-border bg-secondary/70 p-2.5"
          >
            <p class="font-mono text-[10px] text-muted-foreground/70">{{ formatTime(entry.at) }}</p>
            <p class="mt-0.5 line-clamp-2 font-sans text-xs text-foreground/90">{{ entry.text }}</p>
            <div v-if="entry.attachments?.length" class="mt-1 flex flex-wrap gap-1">
              <span
                v-for="name in entry.attachments"
                :key="name"
                class="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-secondary-foreground"
              >
                <Paperclip class="size-2.5" />
                {{ name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 overflow-hidden p-4">
      <h2 class="mb-3 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">设置</h2>
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-3 rounded-lg border border-border bg-secondary/80 p-3">
          <span class="flex items-center gap-2 font-sans text-xs text-foreground/90">
            <Palette class="size-3.5 text-muted-foreground" />
            全局背景
          </span>

          <div class="grid grid-cols-3 gap-1 rounded-md border border-border p-0.5">
            <button
              v-for="opt in MODE_OPTIONS"
              :key="opt.value"
              type="button"
              class="rounded-[5px] py-1.5 font-mono text-[11px] transition-colors"
              :class="
                pref.mode === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="setMode(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>

          <div v-if="pref.mode === 'solid'" class="flex items-center gap-2 pt-1">
            <button
              v-for="color in PRESET_COLORS"
              :key="color"
              type="button"
              aria-label="选择背景颜色"
              :aria-pressed="pref.color === color"
              class="size-6 shrink-0 rounded-full border-2 transition-transform"
              :class="pref.color === color ? 'border-primary scale-110' : 'border-border'"
              :style="{ backgroundColor: color }"
              @click="setColor(color)"
            />
          </div>

          <div v-else-if="pref.mode === 'image'" class="flex flex-col gap-2 pt-1">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              aria-hidden="true"
              tabindex="-1"
              @change="handleFileSelected"
            />
            <button
              type="button"
              class="flex items-center justify-start gap-2 rounded-md border border-border bg-transparent px-3 py-1.5 font-mono text-[11px] text-foreground/90 transition-colors hover:bg-secondary"
              @click="fileInputRef?.click()"
            >
              <Upload class="size-3.5" />
              上传图片
            </button>
            <div v-if="pref.imageDataUrl" class="h-16 w-full overflow-hidden rounded-md border border-border">
              <img :src="pref.imageDataUrl" alt="背景预览" class="size-full object-cover" />
            </div>
            <p v-if="imageError" class="font-mono text-[10px] text-destructive">{{ imageError }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between rounded-lg border border-border bg-secondary/80 p-3">
          <span class="flex items-center gap-2 font-sans text-xs text-foreground/90">
            <Sliders class="size-3.5 text-muted-foreground" />
            形变灵敏度
          </span>
          <span class="font-mono text-[11px] text-muted-foreground">标准</span>
        </div>
        <div class="flex items-center justify-between rounded-lg border border-border bg-secondary/80 p-3">
          <span class="font-sans text-xs text-foreground/90">语音语言</span>
          <span class="font-mono text-[11px] text-muted-foreground">自动检测</span>
        </div>
        <div class="flex items-center justify-between rounded-lg border border-border bg-secondary/80 p-3">
          <span class="font-sans text-xs text-foreground/90">深井视觉深度</span>
          <span class="font-mono text-[11px] text-muted-foreground">中</span>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="skillPlazaOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="技能广场"
      tabindex="-1"
      @click.self="closeSkillPlaza"
      @keydown="onDialogKeydown"
    >
      <div class="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl">
        <div class="mb-4 flex items-start justify-between gap-2">
          <div>
            <h3 class="flex items-center gap-2 font-sans text-sm font-medium text-foreground">
              <Sparkles class="size-4 text-primary" />
              技能广场
            </h3>
            <p class="mt-1 font-mono text-[11px] text-muted-foreground">为磁体球扩展专项能力，即将开放接入</p>
          </div>
          <button
            type="button"
            aria-label="关闭"
            class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            @click="closeSkillPlaza"
          >
            <X class="size-4" />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="skill in SKILLS"
            :key="skill.name"
            class="flex flex-col gap-1.5 rounded-lg border border-border bg-secondary/70 p-3"
          >
            <div class="flex items-center justify-between">
              <component :is="skill.icon" class="size-4 text-muted-foreground" />
              <span
                class="rounded-full border border-border px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground"
              >
                即将上线
              </span>
            </div>
            <p class="font-sans text-xs font-medium text-foreground/90">{{ skill.name }}</p>
            <p class="font-mono text-[10px] leading-relaxed text-muted-foreground">{{ skill.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

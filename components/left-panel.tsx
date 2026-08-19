'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import {
  Settings2,
  History,
  LayoutGrid,
  Sliders,
  Paperclip,
  Sparkles,
  Palette,
  Upload,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useBackground, type BackgroundMode } from '@/lib/background-store'
import { SKILLS } from '@/lib/skills'
import type { TextEntry } from '@/hooks/use-voice-orb'

function formatTime(at: number) {
  return new Date(at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const PRESET_COLORS = [
  'oklch(0.93 0.02 55)',
  'oklch(0.88 0.05 190)',
  'oklch(0.95 0.01 264)',
  'oklch(0.82 0.03 300)',
  'oklch(0.22 0.01 264)',
]

export function LeftPanel({ history }: { history: TextEntry[] }) {
  return (
    <Tabs defaultValue="workbench" className="flex h-full flex-col gap-0">
      <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-border bg-transparent p-0">
        <TabsTrigger
          value="workbench"
          className="gap-1.5 rounded-none border-b-2 border-transparent py-3 font-mono text-[11px] data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          <LayoutGrid className="size-3.5" />
          工作台
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="gap-1.5 rounded-none border-b-2 border-transparent py-3 font-mono text-[11px] data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          <History className="size-3.5" />
          历史
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          className="gap-1.5 rounded-none border-b-2 border-transparent py-3 font-mono text-[11px] data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          <Settings2 className="size-3.5" />
          设置
        </TabsTrigger>
      </TabsList>

      <TabsContent value="workbench" className="flex-1 overflow-hidden p-4">
        <h2 className="mb-3 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">工作台</h2>
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-secondary/80 p-3">
            <p className="font-mono text-[11px] text-muted-foreground">当前会话</p>
            <p className="mt-1 font-sans text-sm text-foreground">液态磁体 · 声音交互</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/80 p-3">
            <p className="font-mono text-[11px] text-muted-foreground">交互提示</p>
            <p className="mt-1 font-sans text-xs leading-relaxed text-muted-foreground">
              拖动球体可将其拉伸变形，松手后会弹性回弯。开启麦克风或输入文字都会让它随声音起伏。
            </p>
          </div>
          <SkillPlazaEntry />
        </div>
      </TabsContent>

      <TabsContent value="history" className="flex-1 overflow-hidden p-0">
        <h2 className="px-4 pt-4 pb-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          历史记录
        </h2>
        <ScrollArea className="h-[calc(100%-2.5rem)] px-4">
          <div className="flex flex-col gap-2 pb-4">
            {history.length === 0 && (
              <p className="font-mono text-xs text-muted-foreground/60">暂无历史记录</p>
            )}
            {history
              .slice()
              .reverse()
              .map((entry) => (
                <div key={entry.id} className="rounded-lg border border-border bg-secondary/70 p-2.5">
                  <p className="font-mono text-[10px] text-muted-foreground/70">{formatTime(entry.at)}</p>
                  <p className="mt-0.5 line-clamp-2 font-sans text-xs text-foreground/90">{entry.text}</p>
                  {entry.attachments && entry.attachments.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {entry.attachments.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-secondary-foreground"
                        >
                          <Paperclip className="size-2.5" />
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="settings" className="flex-1 overflow-hidden p-4">
        <h2 className="mb-3 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">设置</h2>
        <div className="flex flex-col gap-3">
          <BackgroundSettings />
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/80 p-3">
            <span className="flex items-center gap-2 font-sans text-xs text-foreground/90">
              <Sliders className="size-3.5 text-muted-foreground" />
              形变灵敏度
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">标准</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/80 p-3">
            <span className="font-sans text-xs text-foreground/90">语音语言</span>
            <span className="font-mono text-[11px] text-muted-foreground">自动检测</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/80 p-3">
            <span className="font-sans text-xs text-foreground/90">深井视觉深度</span>
            <span className="font-mono text-[11px] text-muted-foreground">中</span>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

/**
 * Background mode/color/image controls. Lives in the existing "设置" tab
 * rather than a separate surface, per the current single-page app shell.
 */
function BackgroundSettings() {
  const { pref, setMode, setColor, setImage } = useBackground()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  function handleModeChange(value: string[]) {
    const next = value[0]
    if (next) setMode(next as BackgroundMode)
  }

  function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('请选择图片文件')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setImageError('图片需小于 4MB')
      return
    }
    setImageError(null)
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/80 p-3">
      <span className="flex items-center gap-2 font-sans text-xs text-foreground/90">
        <Palette className="size-3.5 text-muted-foreground" />
        全局背景
      </span>

      <ToggleGroup
        value={[pref.mode]}
        onValueChange={handleModeChange}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <ToggleGroupItem value="fluid" className="flex-1 font-mono text-[11px]">
          流体
        </ToggleGroupItem>
        <ToggleGroupItem value="solid" className="flex-1 font-mono text-[11px]">
          纯色
        </ToggleGroupItem>
        <ToggleGroupItem value="image" className="flex-1 font-mono text-[11px]">
          图片
        </ToggleGroupItem>
      </ToggleGroup>

      {pref.mode === 'solid' && (
        <div className="flex items-center gap-2 pt-1">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setColor(color)}
              aria-label={`选择背景颜色`}
              aria-pressed={pref.color === color}
              className={cn(
                'size-6 shrink-0 rounded-full border-2 transition-transform',
                pref.color === color ? 'border-primary scale-110' : 'border-border',
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      {pref.mode === 'image' && (
        <div className="flex flex-col gap-2 pt-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelected}
            aria-hidden="true"
            tabIndex={-1}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="justify-start gap-2 font-mono text-[11px]"
          >
            <Upload className="size-3.5" />
            上传图片
          </Button>
          {pref.imageDataUrl && (
            <div className="h-16 w-full overflow-hidden rounded-md border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary user-uploaded data URL, not a static asset */}
              <img src={pref.imageDataUrl} alt="背景预览" className="size-full object-cover" />
            </div>
          )}
          {imageError && <p className="font-mono text-[10px] text-destructive">{imageError}</p>}
        </div>
      )}
    </div>
  )
}

/**
 * Workbench entry point into the skill plaza. Navigates to the dedicated
 * /skills route rather than opening a dialog, so the plaza is its own page.
 */
function SkillPlazaEntry() {
  return (
    <Link
      href="/skills"
      className="group flex w-full items-center justify-between rounded-lg border border-border bg-secondary/80 p-3 text-left transition-colors hover:bg-secondary"
    >
      <span className="flex items-center gap-2">
        <Sparkles className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
        <span className="font-sans text-xs text-foreground/90">技能广场</span>
      </span>
      <Badge variant="secondary" className="font-mono text-[9px]">
        {SKILLS.length}
      </Badge>
    </Link>
  )
}

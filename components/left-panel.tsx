'use client'

import { Settings2, History, LayoutGrid, Sliders, Paperclip } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { TextEntry } from '@/hooks/use-voice-orb'

function formatTime(at: number) {
  return new Date(at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

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

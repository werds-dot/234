'use client'

import { Brain, MessageSquareText, Paperclip } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { OrbMode, ProcessLogEntry, TextEntry } from '@/hooks/use-voice-orb'

function formatTime(at: number) {
  return new Date(at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function RightPanel({
  mode,
  logs,
  textHistory,
}: {
  mode: OrbMode
  logs: ProcessLogEntry[]
  textHistory: TextEntry[]
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Brain className="size-3.5 text-muted-foreground" />
        <h2 className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">思考过程</h2>
        <span
          className={cn(
            'ml-auto size-1.5 rounded-full bg-muted-foreground/50',
            mode !== 'idle' && 'animate-pulse bg-primary',
          )}
        />
      </div>

      <ScrollArea className="h-[42%] shrink-0">
        <div className="flex flex-col gap-1.5 p-4">
          {logs.length === 0 && <p className="font-mono text-xs text-muted-foreground/60">等待输入…</p>}
          {logs
            .slice()
            .reverse()
            .map((entry) => (
              <p key={entry.id} className="font-mono text-[11px] leading-relaxed text-muted-foreground/80">
                <span className="text-muted-foreground/40">{formatTime(entry.at)}</span> {entry.text}
              </p>
            ))}
        </div>
      </ScrollArea>

      <div className="flex items-center gap-2 border-t border-b border-border px-4 py-3">
        <MessageSquareText className="size-3.5 text-muted-foreground" />
        <h2 className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">文字输出</h2>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-2 p-4">
          {textHistory.length === 0 && (
            <p className="font-mono text-xs text-muted-foreground/60">尚未提交任何文字</p>
          )}
          {textHistory
            .slice()
            .reverse()
            .map((entry) => (
              <div key={entry.id} className="rounded-lg border border-border bg-secondary/70 p-2.5">
                <p className="font-mono text-[10px] text-muted-foreground/70">{formatTime(entry.at)}</p>
                <p className="mt-0.5 font-sans text-xs leading-relaxed text-foreground/90">{entry.text}</p>
                {entry.attachments && entry.attachments.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
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
    </div>
  )
}

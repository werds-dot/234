'use client'

import { Paperclip, MessageSquareText } from 'lucide-react'
import { PromptInput } from '@/components/ui/ai-chat-input'
import { cn } from '@/lib/utils'
import type { OrbMode, TextEntry } from '@/hooks/use-voice-orb'

const STATUS_LABEL: Record<OrbMode, string> = {
  idle: '待机中 · 静候声音',
  listening: '聆听中 · 麦克风已开启',
  thinking: '正在感应…',
  speaking: '正在发声',
}

export function VoiceConsole({
  mode,
  latestEntry,
  onSpeak,
}: {
  mode: OrbMode
  latestEntry: TextEntry | null
  onSpeak: (text: string, attachments?: string[]) => void
}) {
  function handleSubmit(value: string, meta: { attachments: File[] }) {
    if (!value.trim() && meta.attachments.length === 0) return
    onSpeak(value, meta.attachments.map((f) => f.name))
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-4 pb-6 sm:pb-10">
      {/* Persistent answer card: stays put next to the orb and only ever
          swaps to the newest entry — it never auto-dismisses on a timer. */}
      {latestEntry && (
        <div className="pointer-events-auto flex w-full max-w-xl flex-col gap-1.5 rounded-2xl border border-border bg-card/95 px-4 py-3 text-left shadow-xl shadow-black/10 backdrop-blur-xl">
          <div
            className={cn(
              'flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase',
              latestEntry.role === 'orb' ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <MessageSquareText className="size-3" />
            {latestEntry.role === 'orb' ? '磁体回复' : '你的输入'}
          </div>
          <p className="font-sans text-sm leading-relaxed text-foreground">{latestEntry.text}</p>
          {latestEntry.attachments && latestEntry.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {latestEntry.attachments.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] text-secondary-foreground"
                >
                  <Paperclip className="size-3" />
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          'pointer-events-none flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 font-mono text-xs tracking-wide text-muted-foreground backdrop-blur-md transition-colors',
          mode === 'listening' && 'text-accent',
          (mode === 'speaking' || mode === 'thinking') && 'text-primary',
        )}
      >
        <span
          className={cn(
            'size-1.5 rounded-full bg-muted-foreground/60',
            mode === 'listening' && 'bg-accent animate-pulse',
            (mode === 'speaking' || mode === 'thinking') && 'bg-primary animate-pulse',
          )}
        />
        {STATUS_LABEL[mode]}
      </div>

      {/* New prompt input (replaces the old mic/attach/input console). Its
          built-in mic does speech-to-text and the Folder button uploads image
          attachments; on submit we hand the text + file names to the orb. */}
      <div className="pointer-events-auto flex w-full justify-center">
        <PromptInput
          onSubmit={handleSubmit}
          placeholder="输入文字，让磁体球开口说话…"
          efforts={['低', '均衡', '全力']}
          folderColor="#C2703A"
        />
      </div>
    </div>
  )
}

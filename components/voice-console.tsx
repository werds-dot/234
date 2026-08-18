'use client'

import { useState, type KeyboardEvent } from 'react'
import { Mic, MicOff, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { OrbMode } from '@/hooks/use-voice-orb'

const STATUS_LABEL: Record<OrbMode, string> = {
  idle: '待机中 · 静候声音',
  listening: '聆听中 · 麦克风已开启',
  thinking: '正在感应…',
  speaking: '正在发声',
}

export function VoiceConsole({
  mode,
  micOn,
  micError,
  onToggleMic,
  onSpeak,
}: {
  mode: OrbMode
  micOn: boolean
  micError: string | null
  onToggleMic: () => void
  onSpeak: (text: string) => void
}) {
  const [value, setValue] = useState('')

  function submit() {
    if (!value.trim()) return
    onSpeak(value)
    setValue('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    // Guard against IME composition (Chinese/Japanese/Korean) confirming on Enter,
    // and Safari's unreliable final composition event (keyCode 229).
    if (e.nativeEvent.isComposing || (e as unknown as { keyCode?: number }).keyCode === 229) return
    e.preventDefault()
    submit()
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-4 pb-6 sm:pb-10">
      <div
        className={cn(
          'pointer-events-none flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 font-mono text-xs tracking-wide text-muted-foreground backdrop-blur-md transition-colors',
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

      <div className="pointer-events-auto flex w-full max-w-xl items-center gap-2 rounded-2xl border border-border/60 bg-card/70 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <Button
          type="button"
          variant={micOn ? 'default' : 'outline'}
          size="icon-lg"
          className="shrink-0 rounded-xl"
          onClick={onToggleMic}
          aria-pressed={micOn}
          aria-label={micOn ? '关闭麦克风' : '开启麦克风'}
        >
          {micOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
        </Button>

        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入文字，让磁体球开口说话…"
          className="h-9 flex-1 border-none bg-transparent font-mono text-sm shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
          aria-label="文字输入"
        />

        <Button
          type="button"
          size="icon-lg"
          className="shrink-0 rounded-xl"
          onClick={submit}
          disabled={!value.trim()}
          aria-label="发送"
        >
          <Send className="size-4" />
        </Button>
      </div>

      <p className="pointer-events-none h-4 text-center font-mono text-[11px] text-destructive" role="status">
        {micError ?? ''}
      </p>
    </div>
  )
}

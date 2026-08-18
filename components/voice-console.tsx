'use client'

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { Mic, MicOff, Paperclip, Send, X, MessageSquareText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  micOn,
  micError,
  latestEntry,
  onToggleMic,
  onSpeak,
}: {
  mode: OrbMode
  micOn: boolean
  micError: string | null
  latestEntry: TextEntry | null
  onToggleMic: () => void
  onSpeak: (text: string, attachments?: string[]) => void
}) {
  const [value, setValue] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  function submit() {
    if (!value.trim()) return
    onSpeak(value, files.map((f) => f.name))
    setValue('')
    setFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    // Guard against IME composition (Chinese/Japanese/Korean) confirming on Enter,
    // and Safari's unreliable final composition event (keyCode 229).
    if (e.nativeEvent.isComposing || (e as unknown as { keyCode?: number }).keyCode === 229) return
    e.preventDefault()
    submit()
  }

  function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length) setFiles((prev) => [...prev, ...selected])
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-4 pb-6 sm:pb-10">
      {/* Persistent answer card: stays put next to the orb and only ever
          swaps to the newest entry — it never auto-dismisses on a timer. */}
      {latestEntry && (
        <div className="pointer-events-auto flex w-full max-w-xl flex-col gap-1.5 rounded-2xl border border-border bg-card/95 px-4 py-3 text-left shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            <MessageSquareText className="size-3" />
            最新内容
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

      <div className="pointer-events-auto flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-2xl shadow-black/10 backdrop-blur-xl">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1.5 pt-1">
            {files.map((file, index) => (
              <span
                key={`${file.name}-${index}`}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 font-mono text-[11px] text-secondary-foreground"
              >
                <Paperclip className="size-3" />
                {file.name}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-0.5 rounded-full text-muted-foreground hover:text-foreground"
                  aria-label={`移除附件 ${file.name}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
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

          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="shrink-0 rounded-xl"
            onClick={() => fileInputRef.current?.click()}
            aria-label="上传文件"
          >
            <Paperclip className="size-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFilesSelected}
            aria-hidden="true"
            tabIndex={-1}
          />

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
      </div>

      <p className="pointer-events-none h-4 text-center font-mono text-[11px] text-destructive" role="status">
        {micError ?? ''}
      </p>
    </div>
  )
}

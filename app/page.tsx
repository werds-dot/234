'use client'

import Link from 'next/link'
import { ArrowRight, MessageSquareText, Paperclip, Sparkles, Workflow } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useConversationHistory } from '@/lib/conversation-store'

const QUICK_ENTRIES = [
  {
    href: '/chat',
    title: '新建对话',
    description: '与液态磁体球开始新的语音或文字交互',
    icon: MessageSquareText,
  },
  {
    href: '/automation',
    title: '自动任务',
    description: '配置定时或触发式的自动化流程',
    icon: Workflow,
  },
  {
    href: '/skills',
    title: '技能广场',
    description: '浏览并启用可供磁体球调用的技能',
    icon: Sparkles,
  },
] as const

function formatTime(at: number) {
  return new Date(at).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function WorkbenchPage() {
  const { history } = useConversationHistory()
  const recent = history.slice().reverse().slice(0, 8)

  return (
    <main className="h-full w-full overflow-y-auto">
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12 sm:px-10">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">工作台</p>
          <h1 className="text-balance font-sans text-2xl font-medium text-foreground">
            欢迎回来，从这里开始一次新的交互
          </h1>
          <p className="max-w-lg text-pretty font-sans text-sm leading-relaxed text-muted-foreground">
            液态磁体球会随你的声音与文字实时变形。挑选下方入口继续，或从最近的对话中接续上一次的内容。
          </p>
        </header>

        <section aria-labelledby="quick-entries-heading" className="flex flex-col gap-4">
          <h2 id="quick-entries-heading" className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            快捷入口
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {QUICK_ENTRIES.map((entry) => {
              const Icon = entry.icon
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="group flex flex-col gap-3 rounded-xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-xl transition-colors hover:border-primary/40 hover:bg-card"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-sans text-sm font-medium text-foreground">{entry.title}</span>
                    <span className="text-pretty font-sans text-xs leading-relaxed text-muted-foreground">
                      {entry.description}
                    </span>
                  </div>
                  <span className="mt-auto flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-primary">
                    进入
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="recent-heading" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 id="recent-heading" className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
              最近对话
            </h2>
            {recent.length > 0 && (
              <Link href="/chat" className="font-mono text-[11px] text-muted-foreground hover:text-foreground">
                查看全部
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card/60 p-10 text-center backdrop-blur-xl">
              <MessageSquareText className="size-5 text-muted-foreground" />
              <p className="font-sans text-sm text-muted-foreground">还没有对话记录</p>
              <Link
                href="/chat"
                className="mt-1 font-mono text-[11px] text-primary underline-offset-4 hover:underline"
              >
                开始第一次对话
              </Link>
            </div>
          ) : (
            <ScrollArea className="h-[min(50vh,420px)] rounded-xl border border-border bg-card/60 backdrop-blur-xl">
              <ul className="flex flex-col divide-y divide-border">
                {recent.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      href="/chat"
                      className="flex flex-col gap-1.5 px-4 py-3 transition-colors hover:bg-secondary/60"
                    >
                      <span className="font-mono text-[10px] text-muted-foreground/70">{formatTime(entry.at)}</span>
                      <span className="line-clamp-2 font-sans text-sm text-foreground/90">{entry.text}</span>
                      {entry.attachments && entry.attachments.length > 0 && (
                        <span className="flex flex-wrap gap-1">
                          {entry.attachments.map((name) => (
                            <span
                              key={name}
                              className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-secondary-foreground"
                            >
                              <Paperclip className="size-2.5" />
                              {name}
                            </span>
                          ))}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </section>
      </div>
    </main>
  )
}

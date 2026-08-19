'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, MessageSquarePlus, Palette, Sparkles, Workflow } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { BackgroundSettingsDialog } from '@/components/background-settings-dialog'

const NAV_ITEMS = [
  { href: '/', label: '工作台', icon: LayoutGrid },
  { href: '/chat', label: '新建对话', icon: MessageSquarePlus },
  { href: '/automation', label: '自动任务', icon: Workflow },
  { href: '/skills', label: '技能广场', icon: Sparkles },
] as const

/**
 * Persistent icon-only navigation rail rendered from the root layout. Sits
 * to the left of every route so switching between the workbench, chat, and
 * the placeholder sections never requires leaving a "shell".
 */
export function NavRail() {
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <nav
      aria-label="主导航"
      className="relative z-10 flex h-full w-16 shrink-0 flex-col items-center gap-1 border-r border-border bg-card/70 py-4 backdrop-blur-xl"
    >
      <Link
        href="/"
        className="mb-3 flex size-9 items-center justify-center rounded-xl bg-primary font-sans text-sm font-semibold text-primary-foreground"
        aria-label="回到工作台"
      >
        液
      </Link>

      <div className="flex flex-1 flex-col items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger
                render={
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                      active && 'bg-secondary text-foreground',
                    )}
                  />
                }
              >
                <Icon className="size-[18px]" />
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="背景设置"
              onClick={() => setSettingsOpen(true)}
              className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            />
          }
        >
          <Palette className="size-[18px]" />
        </TooltipTrigger>
        <TooltipContent side="right">背景设置</TooltipContent>
      </Tooltip>

      <BackgroundSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </nav>
  )
}

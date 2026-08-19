import { Workflow } from 'lucide-react'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'

export default function AutomationPage() {
  return (
    <main className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12 sm:px-10">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">自动任务</p>
          <h1 className="text-balance font-sans text-2xl font-medium text-foreground">
            让磁体球按计划或事件自动响应
          </h1>
          <p className="max-w-lg text-pretty font-sans text-sm leading-relaxed text-muted-foreground">
            配置定时提醒、条件触发的语音播报，或与外部事件联动的自动化流程。
          </p>
        </header>

        <Empty className="flex-1 border border-dashed border-border bg-card/60 backdrop-blur-xl">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Workflow />
            </EmptyMedia>
            <EmptyTitle>暂无自动任务</EmptyTitle>
            <EmptyDescription>这里将展示你创建的自动化任务，功能即将上线。</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Badge variant="secondary">敬请期待</Badge>
          </EmptyContent>
        </Empty>
      </div>
    </main>
  )
}

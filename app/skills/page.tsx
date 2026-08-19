import { Sparkles } from 'lucide-react'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Badge } from '@/components/ui/badge'

export default function SkillsPage() {
  return (
    <main className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12 sm:px-10">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">技能广场</p>
          <h1 className="text-balance font-sans text-2xl font-medium text-foreground">
            为磁体球添加更多能力
          </h1>
          <p className="max-w-lg text-pretty font-sans text-sm leading-relaxed text-muted-foreground">
            浏览可安装的技能模块，扩展语音识别、知识问答与外部工具调用能力。
          </p>
        </header>

        <Empty className="flex-1 border border-dashed border-border bg-card/60 backdrop-blur-xl">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sparkles />
            </EmptyMedia>
            <EmptyTitle>技能广场即将开放</EmptyTitle>
            <EmptyDescription>这里将展示可安装的技能与插件，敬请期待。</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Badge variant="secondary">敬请期待</Badge>
          </EmptyContent>
        </Empty>
      </div>
    </main>
  )
}

import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { SKILLS } from '@/lib/skills'

export const metadata = {
  title: '技能广场 | 液态磁体球',
  description: '为磁体球扩展专项能力：智能改写、实时翻译、代码讲解、写作教练等即将开放接入。',
}

export default function SkillsPage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10 sm:px-10 sm:py-14">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        返回工作台
      </Link>

      <header className="mt-8 flex flex-col gap-2">
        <span className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          <Sparkles className="size-3.5 text-primary" />
          技能广场
        </span>
        <h1 className="font-sans text-2xl font-medium text-balance text-foreground">为磁体球扩展专项能力</h1>
        <p className="max-w-lg font-sans text-sm leading-relaxed text-pretty text-muted-foreground">
          下面是即将开放接入的技能模块。启用后，磁体球会在声音交互的基础上获得对应的专项处理能力。
        </p>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SKILLS.map(({ icon: Icon, name, desc }) => (
          <article
            key={name}
            className="group flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-xl transition-colors hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors group-hover:text-primary">
                <Icon className="size-5" />
              </span>
              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                即将上线
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="font-sans text-base font-medium text-foreground">{name}</h2>
              <p className="font-sans text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

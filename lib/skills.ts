import { Wand2, Languages, Code2, PenLine, type LucideIcon } from 'lucide-react'

export type Skill = { icon: LucideIcon; name: string; desc: string }

/**
 * Skill catalog shared between the workbench entry (badge count) and the
 * dedicated /skills page, so the two never drift out of sync.
 */
export const SKILLS: Skill[] = [
  { icon: Wand2, name: '智能改写', desc: '一键优化语言表达与语气' },
  { icon: Languages, name: '实时翻译', desc: '多语言语音互译，即说即译' },
  { icon: Code2, name: '代码讲解', desc: '朗读并逐段解释代码片段' },
  { icon: PenLine, name: '写作教练', desc: '结构化长文写作与润色建议' },
]

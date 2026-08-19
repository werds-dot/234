<script setup lang="ts">
import { ArrowLeft, Sparkles } from 'lucide-vue-next'
import { SKILLS } from '../composables/skills'
import { useAppView } from '../composables/useAppView'

const { goToMain } = useAppView()
</script>

<template>
  <main class="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10 sm:px-10 sm:py-14">
    <button
      type="button"
      class="inline-flex w-fit items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      @click="goToMain"
    >
      <ArrowLeft class="size-3.5" />
      返回工作台
    </button>

    <header class="mt-8 flex flex-col gap-2">
      <span class="flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
        <Sparkles class="size-3.5 text-primary" />
        技能广场
      </span>
      <h1 class="font-sans text-2xl font-medium text-balance text-foreground">为磁体球扩展专项能力</h1>
      <p class="max-w-lg font-sans text-sm leading-relaxed text-pretty text-muted-foreground">
        下面是即将开放接入的技能模块。启用后，磁体球会在声音交互的基础上获得对应的专项处理能力。
      </p>
    </header>

    <section class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <article
        v-for="skill in SKILLS"
        :key="skill.name"
        class="group flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-xl transition-colors hover:border-primary/40"
      >
        <div class="flex items-center justify-between">
          <span
            class="flex size-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors group-hover:text-primary"
          >
            <component :is="skill.icon" class="size-5" />
          </span>
          <span class="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            即将上线
          </span>
        </div>
        <div class="flex flex-col gap-1.5">
          <h2 class="font-sans text-base font-medium text-foreground">{{ skill.name }}</h2>
          <p class="font-sans text-sm leading-relaxed text-muted-foreground">{{ skill.desc }}</p>
        </div>
      </article>
    </section>
  </main>
</template>

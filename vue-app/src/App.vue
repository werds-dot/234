<script setup lang="ts">
import { computed } from 'vue'
import { useVoiceOrb } from './composables/useVoiceOrb'
import { useAppView } from './composables/useAppView'
import OrbScene from './components/OrbScene.vue'
import DeepWell from './components/DeepWell.vue'
import TiltedPanel from './components/TiltedPanel.vue'
import LeftPanel from './components/LeftPanel.vue'
import RightPanel from './components/RightPanel.vue'
import VoiceConsole from './components/VoiceConsole.vue'
import BackgroundLayer from './components/BackgroundLayer.vue'
import SkillsPage from './components/SkillsPage.vue'

const { mode, textHistory, processLog, speak, audio } = useVoiceOrb()
const { view } = useAppView()

const latestEntry = computed(() =>
  textHistory.value.length ? textHistory.value[textHistory.value.length - 1] : null,
)
</script>

<template>
  <BackgroundLayer />

  <SkillsPage v-if="view === 'skills'" />

  <main v-else class="relative flex h-screen w-full items-stretch overflow-hidden">
    <TiltedPanel side="left">
      <LeftPanel :history="textHistory" />
    </TiltedPanel>

    <div class="relative min-w-0 flex-1 overflow-hidden">
      <header class="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-1 px-4 pt-8 text-center">
        <h1 class="font-sans text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">液态磁体</h1>
        <p class="max-w-xs font-mono text-xs text-muted-foreground/60">拖动、说话、打字，看它如何回应</p>
      </header>

      <DeepWell>
        <OrbScene :audio="audio" />
      </DeepWell>

      <VoiceConsole :mode="mode" :latest-entry="latestEntry" @speak="speak" />
    </div>

    <TiltedPanel side="right">
      <RightPanel :mode="mode" :logs="processLog" :text-history="textHistory" />
    </TiltedPanel>
  </main>
</template>

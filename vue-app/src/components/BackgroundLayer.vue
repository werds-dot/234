<script setup lang="ts">
import { useBackgroundStore } from '../composables/useBackgroundStore'

// Fixed, full-viewport backdrop rendered once at the app root, behind all
// page content. The tilted side panels and voice console cards are
// deliberately translucent (bg-card/80, bg-card/95 + backdrop-blur), so
// whichever mode is active here shows through as a soft frosted-glass
// effect rather than a flat page background.
const { pref } = useBackgroundStore()
</script>

<template>
  <div class="fixed inset-0 -z-10 overflow-hidden bg-background" aria-hidden="true">
    <template v-if="pref.mode === 'fluid'">
      <div
        class="absolute -inset-[20%] opacity-60 blur-3xl"
        style="
          background: radial-gradient(circle at 30% 30%, oklch(0.86 0.07 55), transparent 60%);
          animation: fluid-drift-a 28s ease-in-out infinite;
        "
      />
      <div
        class="absolute -inset-[20%] opacity-50 blur-3xl"
        style="
          background: radial-gradient(circle at 72% 62%, oklch(0.85 0.06 190), transparent 60%);
          animation: fluid-drift-b 34s ease-in-out infinite;
        "
      />
      <div
        class="absolute -inset-[20%] opacity-40 blur-3xl"
        style="
          background: radial-gradient(circle at 50% 82%, oklch(0.96 0.005 264), transparent 65%);
          animation: fluid-drift-c 40s ease-in-out infinite;
        "
      />
    </template>

    <div v-else-if="pref.mode === 'solid'" class="absolute inset-0" :style="{ backgroundColor: pref.color }" />

    <div
      v-else-if="pref.mode === 'image' && pref.imageDataUrl"
      class="absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url(${pref.imageDataUrl})` }"
    />
  </div>
</template>

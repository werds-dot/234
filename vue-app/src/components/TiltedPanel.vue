<script setup lang="ts">
// A side panel tilted inward around its vertical hinge (the outer screen
// edge), as if the whole surface leans toward the viewer/center — like the
// inner walls of the deep well continuing outward.
const { side } = defineProps<{ side: 'left' | 'right' }>()
</script>

<template>
  <div class="hidden shrink-0 md:block" style="perspective: 1600px; width: clamp(200px, 17vw, 260px)">
    <div
      class="h-full border border-border bg-card/60 shadow-2xl shadow-black/50 backdrop-blur-xl"
      :class="side === 'left' ? 'rounded-r-2xl border-l-0' : 'rounded-l-2xl border-r-0'"
      :style="{
        transform: side === 'left' ? 'rotateY(14deg)' : 'rotateY(-14deg)',
        transformOrigin: side === 'left' ? 'left center' : 'right center',
      }"
    >
      <slot />
    </div>
  </div>
</template>

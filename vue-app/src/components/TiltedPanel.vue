<script setup lang="ts">
// A side panel tilted inward around its vertical hinge (the outer screen
// edge), as if the whole surface leans toward the viewer/center — like the
// inner walls of the deep well continuing outward.
const { side } = defineProps<{ side: 'left' | 'right' }>()
</script>

<template>
  <div
    class="hidden shrink-0 md:flex md:items-center"
    :class="side === 'left' ? 'md:justify-start' : 'md:justify-end'"
    style="perspective: 1600px; width: clamp(248px, 21vw, 372px)"
  >
    <div
      class="h-[88%] w-full border border-border bg-card/80 shadow-2xl shadow-black/10 backdrop-blur-xl"
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

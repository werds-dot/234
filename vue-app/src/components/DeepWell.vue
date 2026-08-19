<script setup lang="ts">
// Circular "deep well" shell around the orb: a dark radial gradient plus a
// layered inset shadow to fake looking straight down into a recessed shaft,
// with the orb sitting at the bottom, lit from above.
</script>

<template>
  <div class="relative flex size-full items-center justify-center">
    <!-- Soft ambient halo so the dark well reads as an intentional spotlight
         against the white page instead of a harsh floating disc. -->
    <div class="well-halo" />
    <div class="well">
      <div class="well-inner-shadow" />
      <div class="absolute inset-0">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.well-halo {
  pointer-events: none;
  position: absolute;
  aspect-ratio: 1 / 1;
  width: min(70vh, 70vw, 640px);
  border-radius: 9999px;
  box-shadow: 0 0 120px 40px oklch(0 0 0 / 6%);
}

.well {
  position: relative;
  aspect-ratio: 1 / 1;
  width: min(62vh, 62vw, 560px);
  border-radius: 9999px;
  background: radial-gradient(
    circle at 50% 38%,
    oklch(0.32 0.006 264) 0%,
    oklch(0.22 0.005 264) 42%,
    oklch(0.13 0.004 264) 72%,
    oklch(0.09 0.003 264) 100%
  );
  box-shadow:
    inset 0 18px 60px 10px oklch(0 0 0 / 65%),
    inset 0 -6px 30px 0 oklch(1 0 0 / 6%),
    inset 0 0 0 1px oklch(1 0 0 / 8%),
    0 30px 80px -20px oklch(0 0 0 / 35%);
}

.well-inner-shadow {
  pointer-events: none;
  position: absolute;
  inset: 6%;
  border-radius: 9999px;
  box-shadow: inset 0 12px 40px 4px oklch(0 0 0 / 50%);
}
</style>

<script setup lang="ts">
// Circular "deep well" shell around the orb: a dark radial gradient plus a
// layered inset shadow to fake looking straight down into a recessed shaft,
// with the orb sitting at the bottom, lit from above.
</script>

<template>
  <div class="relative flex size-full items-center justify-center">
    <!-- Soft ambient halo so the film bezel reads as an intentional spotlight
         against the page instead of a harsh floating disc. -->
    <div class="well-halo" />
    <!-- Filmstrip bezel (dark film band + sprocket perforations) ringing the
         well, in place of the former plain white halo. -->
    <div class="film-ring" />
    <div class="well">
      <div class="well-inner-shadow" />
      <!-- overflow-hidden here mirrors the React well: the WebGL canvas is a
           plain rectangle, so without clipping its square corners bleed out
           past this circular mask while the orb repaints (e.g. mid-drag). -->
      <div class="absolute inset-0 overflow-hidden rounded-full">
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
  width: min(74vh, 74vw, 676px);
  border-radius: 9999px;
  box-shadow: 0 0 120px 40px oklch(0 0 0 / 6%);
}

/* Filmstrip bezel ringing the well: a dark photographic-film band with evenly
   spaced sprocket perforations, replacing the former plain white halo.
   Percentages are relative to the element radius (closest-side), so the band
   tucks just under the well's edge and the holes sit centered in the bezel. */
.film-ring {
  pointer-events: none;
  position: absolute;
  aspect-ratio: 1 / 1;
  width: min(70vh, 70vw, 632px);
  border-radius: 9999px;
  background: radial-gradient(circle closest-side at 50% 34%, oklch(0.27 0.008 60), oklch(0.16 0.006 60) 72%);
  -webkit-mask: radial-gradient(circle closest-side at center, transparent 0 87%, #000 88% 99.4%, transparent 100%);
  mask: radial-gradient(circle closest-side at center, transparent 0 87%, #000 88% 99.4%, transparent 100%);
}
.film-ring::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  /* light punch-outs every 6deg (60 perforations around the reel) */
  background: repeating-conic-gradient(
    from 0deg,
    oklch(0.96 0.004 250) 0deg 1.5deg,
    transparent 1.5deg 6deg
  );
  -webkit-mask: radial-gradient(circle closest-side at center, transparent 0 90%, #000 90.7% 96.3%, transparent 97%);
  mask: radial-gradient(circle closest-side at center, transparent 0 90%, #000 90.7% 96.3%, transparent 97%);
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

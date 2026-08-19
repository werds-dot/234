import { reactive, watch } from 'vue'

export type BackgroundMode = 'fluid' | 'solid' | 'image'

export type BackgroundPref = {
  mode: BackgroundMode
  color: string
  imageDataUrl: string | null
}

const STORAGE_KEY = 'liquid-orb.background-pref'

const DEFAULT_PREF: BackgroundPref = {
  mode: 'fluid',
  color: 'oklch(0.93 0.02 55)',
  imageDataUrl: null,
}

export const PRESET_COLORS = [
  'oklch(0.93 0.02 55)',
  'oklch(0.88 0.05 190)',
  'oklch(0.95 0.01 264)',
  'oklch(0.82 0.03 300)',
  'oklch(0.22 0.01 264)',
]

// Module-level singleton so every component calling useBackgroundStore()
// shares the same reactive state -- the Vue equivalent of the React
// BackgroundProvider context, without needing a provide/inject wrapper
// around the app root.
const pref = reactive<BackgroundPref>({ ...DEFAULT_PREF })
let hydrated = false

function hydrate() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) Object.assign(pref, JSON.parse(raw))
  } catch {
    // Ignore malformed/unavailable storage; fall back to defaults.
  }
  hydrated = true
}

if (typeof window !== 'undefined') {
  hydrate()
  watch(
    pref,
    () => {
      // hydrate() above runs synchronously before this watcher is ever
      // registered, so in practice this always sees hydrated === true --
      // the flag is kept as an explicit guard against persisting the
      // in-memory default over a saved preference.
      if (!hydrated) return
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pref))
      } catch {
        // Storage may be unavailable (e.g. private mode); safe to ignore.
      }
    },
    { deep: true },
  )
}

export function useBackgroundStore() {
  function setMode(mode: BackgroundMode) {
    pref.mode = mode
  }
  function setColor(color: string) {
    pref.color = color
    pref.mode = 'solid'
  }
  function setImage(dataUrl: string | null) {
    pref.imageDataUrl = dataUrl
    if (dataUrl) pref.mode = 'image'
  }
  return { pref, setMode, setColor, setImage }
}

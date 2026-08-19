'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

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

type BackgroundContextValue = {
  pref: BackgroundPref
  setMode: (mode: BackgroundMode) => void
  setColor: (color: string) => void
  setImage: (dataUrl: string | null) => void
}

const BackgroundContext = createContext<BackgroundContextValue | null>(null)

/**
 * Global background preference (fluid gradient / solid color / uploaded
 * image), persisted to localStorage since it is a cosmetic app-shell
 * preference, not user data that needs a backend. Shared via context so the
 * nav rail's settings panel and the background layer stay in sync everywhere.
 */
export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [pref, setPref] = useState<BackgroundPref>(DEFAULT_PREF)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setPref((prev) => ({ ...prev, ...JSON.parse(raw) }))
    } catch {
      // Ignore malformed/unavailable storage; fall back to defaults.
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pref))
    } catch {
      // Storage may be unavailable (e.g. private mode); safe to ignore.
    }
  }, [pref])

  const setMode = useCallback((mode: BackgroundMode) => setPref((p) => ({ ...p, mode })), [])
  const setColor = useCallback((color: string) => setPref((p) => ({ ...p, color, mode: 'solid' })), [])
  const setImage = useCallback(
    (imageDataUrl: string | null) =>
      setPref((p) => ({ ...p, imageDataUrl, mode: imageDataUrl ? 'image' : p.mode })),
    [],
  )

  return (
    <BackgroundContext.Provider value={{ pref, setMode, setColor, setImage }}>
      {children}
    </BackgroundContext.Provider>
  )
}

export function useBackground() {
  const ctx = useContext(BackgroundContext)
  if (!ctx) throw new Error('useBackground must be used within a BackgroundProvider')
  return ctx
}

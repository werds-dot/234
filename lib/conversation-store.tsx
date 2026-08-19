'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type TextEntry = {
  id: number
  text: string
  at: number
  attachments?: string[]
  // 'user' is the person's input, 'orb' is the magnet's spoken reply. Optional
  // so entries persisted before replies existed still read as user messages.
  role?: 'user' | 'orb'
}

const STORAGE_KEY = 'liquid-orb.conversation-history'
const MAX_ENTRIES = 100

type ConversationContextValue = {
  history: TextEntry[]
  addEntry: (entry: TextEntry) => void
  clear: () => void
}

const ConversationContext = createContext<ConversationContextValue | null>(null)

/**
 * Shared conversation history so the "workbench" home page can show recent
 * conversations alongside the /chat page that actually produces them.
 * Persisted to localStorage purely so a reload doesn't wipe a session's
 * transcript; there is no backend for this demo app.
 */
export function ConversationProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<TextEntry[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setHistory(JSON.parse(raw))
    } catch {
      // Ignore malformed/unavailable storage.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_ENTRIES)))
    } catch {
      // Storage may be unavailable; safe to ignore.
    }
  }, [history, hydrated])

  const addEntry = useCallback((entry: TextEntry) => {
    setHistory((prev) => [...prev.slice(-(MAX_ENTRIES - 1)), entry])
  }, [])

  const clear = useCallback(() => setHistory([]), [])

  return (
    <ConversationContext.Provider value={{ history, addEntry, clear }}>{children}</ConversationContext.Provider>
  )
}

export function useConversationHistory() {
  const ctx = useContext(ConversationContext)
  if (!ctx) throw new Error('useConversationHistory must be used within a ConversationProvider')
  return ctx
}

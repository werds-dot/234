'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

export type OrbMode = 'idle' | 'listening' | 'thinking' | 'speaking'

export type OrbAudioRefs = {
  modeRef: RefObject<OrbMode>
  analyserRef: RefObject<AnalyserNode | null>
  freqDataRef: RefObject<Uint8Array | null>
  spikesRef: RefObject<number[]>
}

/**
 * Owns microphone capture, speech synthesis, and the mutable refs the R3F
 * orb reads every frame. State like `mode`/`micError` is React state for the
 * UI; the ref bundle is read directly inside useFrame to avoid re-rendering
 * the scene on every audio sample.
 */
export function useVoiceOrb() {
  const [mode, setMode] = useState<OrbMode>('idle')
  const [micOn, setMicOn] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const [lastText, setLastText] = useState<string | null>(null)

  const modeRef = useRef<OrbMode>('idle')
  const analyserRef = useRef<AnalyserNode | null>(null)
  const freqDataRef = useRef<Uint8Array | null>(null)
  const spikesRef = useRef<number[]>([])

  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const stopMic = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    analyserRef.current = null
    freqDataRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    setMicOn(false)
    setMode((current) => (current === 'listening' ? 'idle' : current))
  }, [])

  const startMic = useCallback(async () => {
    setMicError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)

      streamRef.current = stream
      audioCtxRef.current = audioCtx
      analyserRef.current = analyser
      freqDataRef.current = new Uint8Array(analyser.frequencyBinCount)

      setMicOn(true)
      setMode('listening')
    } catch (err) {
      setMicError('麦克风访问被拒绝，请检查浏览器权限设置。')
    }
  }, [])

  const toggleMic = useCallback(() => {
    if (micOn) {
      stopMic()
    } else {
      startMic()
    }
  }, [micOn, startMic, stopMic])

  const speak = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      // Pause mic listening while speaking to avoid the orb reacting to its own voice.
      const wasListening = modeRef.current === 'listening'
      setLastText(trimmed)
      setMode('thinking')

      window.setTimeout(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
          setMode(wasListening ? 'listening' : 'idle')
          return
        }

        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(trimmed)
        utterance.lang = /[\u4e00-\u9fa5]/.test(trimmed) ? 'zh-CN' : 'en-US'
        utterance.rate = 1
        utterance.pitch = 1

        utterance.onstart = () => {
          spikesRef.current = []
          setMode('speaking')
        }
        utterance.onboundary = () => {
          spikesRef.current = [...spikesRef.current, performance.now()]
        }
        const finish = () => {
          setMode(wasListening ? 'listening' : 'idle')
        }
        utterance.onend = finish
        utterance.onerror = finish

        window.speechSynthesis.speak(utterance)
      }, 500)
    },
    [],
  )

  useEffect(() => {
    return () => {
      stopMic()
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [stopMic])

  const refs: OrbAudioRefs = { modeRef, analyserRef, freqDataRef, spikesRef }

  return { mode, micOn, micError, lastText, toggleMic, speak, refs }
}

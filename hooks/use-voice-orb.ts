'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useConversationHistory, type TextEntry } from '@/lib/conversation-store'

export type OrbMode = 'idle' | 'listening' | 'thinking' | 'speaking'

// Re-exported for backward compatibility: other components import TextEntry
// from this hook, but the entries themselves now live in the shared
// ConversationProvider so the workbench home page can read them too.
export type { TextEntry }
export type ProcessLogEntry = { id: number; text: string; at: number }

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
  const { history: textHistory, addEntry } = useConversationHistory()
  const [mode, setMode] = useState<OrbMode>('idle')
  const [micOn, setMicOn] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const [lastText, setLastText] = useState<string | null>(null)
  const [processLog, setProcessLog] = useState<ProcessLogEntry[]>([])

  const modeRef = useRef<OrbMode>('idle')
  const analyserRef = useRef<AnalyserNode | null>(null)
  const freqDataRef = useRef<Uint8Array | null>(null)
  const spikesRef = useRef<number[]>([])
  const logIdRef = useRef(0)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const pushLog = useCallback((text: string) => {
    logIdRef.current += 1
    setProcessLog((prev) => [...prev.slice(-19), { id: logIdRef.current, text, at: Date.now() }])
  }, [])

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
    pushLog('麦克风已关闭，停止音频采样')
  }, [pushLog])

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
      pushLog('麦克风已开启，开始采集频谱数据')
    } catch (err) {
      setMicError('麦克风访问被拒绝，请检查浏览器权限设置。')
      pushLog('麦克风请求被拒绝')
    }
  }, [pushLog])

  const toggleMic = useCallback(() => {
    if (micOn) {
      stopMic()
    } else {
      startMic()
    }
  }, [micOn, startMic, stopMic])

  const speak = useCallback(
    (text: string, attachments?: string[]) => {
      const trimmed = text.trim()
      if (!trimmed) return

      // Pause mic listening while speaking to avoid the orb reacting to its own voice.
      const wasListening = modeRef.current === 'listening'
      setLastText(trimmed)
      addEntry({
        id: Date.now(),
        text: trimmed,
        at: Date.now(),
        attachments: attachments?.length ? attachments : undefined,
      })
      setMode('thinking')
      pushLog(`收到输入，正在解析文本："${trimmed.slice(0, 24)}${trimmed.length > 24 ? '…' : ''}"`)

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
          pushLog('开始语音合成输出')
        }
        utterance.onboundary = () => {
          spikesRef.current = [...spikesRef.current, performance.now()]
        }
        const finish = () => {
          setMode(wasListening ? 'listening' : 'idle')
          pushLog('输出结束，恢复待机')
        }
        utterance.onend = finish
        utterance.onerror = finish

        window.speechSynthesis.speak(utterance)
      }, 500)
    },
    [pushLog],
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

  return { mode, micOn, micError, lastText, textHistory, processLog, toggleMic, speak, refs }
}

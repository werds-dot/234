import { reactive, ref } from 'vue'

export type OrbMode = 'idle' | 'listening' | 'thinking' | 'speaking'

export type TextEntry = { id: number; text: string; at: number; attachments?: string[] }
export type ProcessLogEntry = { id: number; text: string; at: number }

// Plain (non-reactive-by-Vue) audio buffers, read directly inside the
// render loop each frame -- mirrors the ref-based audio bridge used in the
// React version so the 3D loop never depends on Vue's reactivity system.
export type OrbAudioState = {
  analyser: AnalyserNode | null
  freqData: Uint8Array | null
}

let logId = 0

export function useVoiceOrb() {
  const mode = ref<OrbMode>('idle')
  const micOn = ref(false)
  const micError = ref<string | null>(null)
  const lastText = ref<string | null>(null)
  const textHistory = ref<TextEntry[]>([])
  const processLog = ref<ProcessLogEntry[]>([])

  const audio = reactive<OrbAudioState>({ analyser: null, freqData: null })

  let audioCtx: AudioContext | null = null
  let stream: MediaStream | null = null

  function pushLog(text: string) {
    logId += 1
    processLog.value = [...processLog.value.slice(-19), { id: logId, text, at: Date.now() }]
  }

  function stopMic() {
    stream?.getTracks().forEach((track) => track.stop())
    stream = null
    audio.analyser = null
    audio.freqData = null
    audioCtx?.close().catch(() => {})
    audioCtx = null
    micOn.value = false
    if (mode.value === 'listening') mode.value = 'idle'
    pushLog('麦克风已关闭，停止音频采样')
  }

  async function startMic() {
    micError.value = null
    try {
      const requestedStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(requestedStream)
      const analyserNode = ctx.createAnalyser()
      analyserNode.fftSize = 256
      analyserNode.smoothingTimeConstant = 0.8
      source.connect(analyserNode)

      stream = requestedStream
      audioCtx = ctx
      audio.analyser = analyserNode
      audio.freqData = new Uint8Array(analyserNode.frequencyBinCount)

      micOn.value = true
      mode.value = 'listening'
      pushLog('麦克风已开启，开始采集频谱数据')
    } catch {
      micError.value = '麦克风访问被拒绝，请检查浏览器权限设置。'
      pushLog('麦克风请求被拒绝')
    }
  }

  function toggleMic() {
    if (micOn.value) stopMic()
    else startMic()
  }

  function speak(text: string, attachments?: string[]) {
    const trimmed = text.trim()
    if (!trimmed) return

    // Pause mic listening while speaking to avoid the orb reacting to its own voice.
    const wasListening = mode.value === 'listening'
    lastText.value = trimmed
    textHistory.value = [
      ...textHistory.value,
      { id: Date.now(), text: trimmed, at: Date.now(), attachments: attachments?.length ? attachments : undefined },
    ]
    mode.value = 'thinking'
    pushLog(`收到输入，正在解析文本："${trimmed.slice(0, 24)}${trimmed.length > 24 ? '…' : ''}"`)

    window.setTimeout(() => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        mode.value = wasListening ? 'listening' : 'idle'
        return
      }

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(trimmed)
      utterance.lang = /[\u4e00-\u9fa5]/.test(trimmed) ? 'zh-CN' : 'en-US'
      utterance.rate = 1
      utterance.pitch = 1

      utterance.onstart = () => {
        mode.value = 'speaking'
        pushLog('开始语音合成输出')
      }
      const finish = () => {
        mode.value = wasListening ? 'listening' : 'idle'
        pushLog('输出结束，恢复待机')
      }
      utterance.onend = finish
      utterance.onerror = finish

      window.speechSynthesis.speak(utterance)
    }, 500)
  }

  return { mode, micOn, micError, lastText, textHistory, processLog, toggleMic, speak, audio }
}

'use client'

import dynamic from 'next/dynamic'
import { useVoiceOrb } from '@/hooks/use-voice-orb'
import { VoiceConsole } from '@/components/voice-console'
import { DeepWell } from '@/components/deep-well'
import { RightPanel } from '@/components/right-panel'

const OrbScene = dynamic(() => import('@/components/orb-scene').then((mod) => mod.OrbScene), {
  ssr: false,
})

export default function ChatPage() {
  const { mode, micOn, micError, textHistory, processLog, toggleMic, speak, refs } = useVoiceOrb()

  return (
    <main className="flex h-full w-full items-stretch overflow-hidden">
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-1 px-4 pt-8 text-center">
          <h1 className="font-sans text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
            液态磁体
          </h1>
          <p className="max-w-xs font-mono text-xs text-muted-foreground/60">拖动、说话、打字，看它如何回应</p>
        </header>

        <DeepWell>
          <OrbScene audio={refs} />
        </DeepWell>

        <VoiceConsole
          mode={mode}
          micOn={micOn}
          micError={micError}
          latestEntry={textHistory.length ? textHistory[textHistory.length - 1] : null}
          onToggleMic={toggleMic}
          onSpeak={speak}
        />
      </div>

      <aside className="hidden w-[clamp(260px,22vw,340px)] shrink-0 border-l border-border bg-card/80 backdrop-blur-xl md:block">
        <RightPanel mode={mode} logs={processLog} textHistory={textHistory} />
      </aside>
    </main>
  )
}

'use client'

import dynamic from 'next/dynamic'
import { useVoiceOrb } from '@/hooks/use-voice-orb'
import { VoiceConsole } from '@/components/voice-console'
import { DeepWell } from '@/components/deep-well'
import { TiltedPanel } from '@/components/tilted-panel'
import { LeftPanel } from '@/components/left-panel'
import { RightPanel } from '@/components/right-panel'

const OrbScene = dynamic(() => import('@/components/orb-scene').then((mod) => mod.OrbScene), {
  ssr: false,
})

export default function Page() {
  const { mode, textHistory, processLog, speak, refs } = useVoiceOrb()

  return (
    <main className="relative flex h-screen w-full items-stretch overflow-hidden">
      <TiltedPanel side="left">
        <LeftPanel history={textHistory} />
      </TiltedPanel>

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
          latestEntry={textHistory.length ? textHistory[textHistory.length - 1] : null}
          onSpeak={speak}
        />
      </div>

      <TiltedPanel side="right">
        <RightPanel mode={mode} logs={processLog} textHistory={textHistory} />
      </TiltedPanel>
    </main>
  )
}

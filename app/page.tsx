'use client'

import dynamic from 'next/dynamic'
import { useVoiceOrb } from '@/hooks/use-voice-orb'
import { VoiceConsole } from '@/components/voice-console'

const OrbScene = dynamic(() => import('@/components/orb-scene').then((mod) => mod.OrbScene), {
  ssr: false,
})

export default function Page() {
  const { mode, micOn, micError, toggleMic, speak, refs } = useVoiceOrb()

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <header className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-1 px-4 pt-8 text-center">
        <h1 className="font-sans text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
          液态磁体
        </h1>
        <p className="max-w-xs font-mono text-xs text-muted-foreground/60">
          说话、打字，看它如何回应
        </p>
      </header>

      <div className="absolute inset-0">
        <OrbScene audio={refs} />
      </div>

      <VoiceConsole mode={mode} micOn={micOn} micError={micError} onToggleMic={toggleMic} onSpeak={speak} />
    </main>
  )
}

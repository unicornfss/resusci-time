import { useEffect, useRef } from 'react'
import { createMetronome, type MetronomeController } from '../metronome'

export function useMetronome(active: boolean) {
  const metronomeRef = useRef<MetronomeController | null>(null)

  useEffect(() => {
    if (!metronomeRef.current) {
      metronomeRef.current = createMetronome()
    }

    const metronome = metronomeRef.current
    if (active) {
      void metronome.start()
    } else {
      metronome.stop()
    }

    return () => {
      metronome.stop()
    }
  }, [active])

  useEffect(() => {
    return () => {
      metronomeRef.current?.dispose()
      metronomeRef.current = null
    }
  }, [])
}

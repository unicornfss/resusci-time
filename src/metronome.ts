export const METRONOME_BPM = 100

export interface MetronomeController {
  start: () => Promise<void>
  stop: () => void
  dispose: () => void
  readonly isRunning: boolean
}

export function createMetronome(bpm = METRONOME_BPM): MetronomeController {
  let audioContext: AudioContext | null = null
  let schedulerId: ReturnType<typeof setTimeout> | null = null
  let nextBeatTime = 0
  let running = false

  function playTick(time: number) {
    if (!audioContext) return

    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(0.22, time + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(time)
    oscillator.stop(time + 0.06)
  }

  async function ensureContext() {
    if (!audioContext) {
      audioContext = new AudioContext()
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
    return audioContext
  }

  function schedule() {
    if (!audioContext || !running) return

    const beatInterval = 60 / bpm
    while (nextBeatTime < audioContext.currentTime + 0.1) {
      playTick(nextBeatTime)
      nextBeatTime += beatInterval
    }

    schedulerId = setTimeout(schedule, 25)
  }

  return {
    get isRunning() {
      return running
    },

    async start() {
      const context = await ensureContext()
      if (running) return
      running = true
      nextBeatTime = context.currentTime + 0.05
      schedule()
    },

    stop() {
      running = false
      if (schedulerId !== null) {
        clearTimeout(schedulerId)
        schedulerId = null
      }
    },

    dispose() {
      this.stop()
      if (audioContext) {
        void audioContext.close()
        audioContext = null
      }
    },
  }
}

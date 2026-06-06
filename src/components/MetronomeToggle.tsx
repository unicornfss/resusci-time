import { METRONOME_BPM } from '../metronome'
import { TimerActionButton } from './TimerActionButton'

interface MetronomeToggleProps {
  enabled: boolean
  onToggle: () => void
  variant?: 'standalone' | 'timer-bar'
}

export function MetronomeToggle({ enabled, onToggle, variant = 'standalone' }: MetronomeToggleProps) {
  if (variant === 'timer-bar') {
    return (
      <TimerActionButton
        variant="metronome"
        isActive={enabled}
        aria-pressed={enabled}
        aria-label={
          enabled
            ? `Turn off metronome (${METRONOME_BPM} beats per minute)`
            : `Turn on metronome (${METRONOME_BPM} beats per minute)`
        }
        onClick={onToggle}
      >
        {enabled ? 'Turn off metronome' : 'Turn on metronome'}
      </TimerActionButton>
    )
  }

  return (
    <div className="metronome-bar">
      <button
        type="button"
        className={`btn btn-sm metronome-toggle${enabled ? ' active' : ''}`}
        aria-pressed={enabled}
        onClick={onToggle}
      >
        Metronome ({METRONOME_BPM} bpm): {enabled ? 'On' : 'Off'}
      </button>
    </div>
  )
}

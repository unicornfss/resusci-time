import { METRONOME_BPM } from '../metronome'

interface MetronomeToggleProps {
  enabled: boolean
  onToggle: () => void
}

export function MetronomeToggle({ enabled, onToggle }: MetronomeToggleProps) {
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

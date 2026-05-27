import { useState } from 'react'
import {
  formatRhythmLogLabel,
  getDefaultShockJoules,
  SHOCK_DEFAULT_ENERGIES_JOULES,
} from '../shock-config'

interface ShockFormProps {
  shockNumber: number
  onSelect: (joules: number) => void
  onCancel?: () => void
}

export function ShockForm({ shockNumber, onSelect, onCancel }: ShockFormProps) {
  const presets = [...new Set(SHOCK_DEFAULT_ENERGIES_JOULES)]
  const defaultJoules = getDefaultShockJoules(shockNumber - 1)
  const [selectedJoules, setSelectedJoules] = useState(defaultJoules)

  return (
    <div className="shock-box">
      <p className="shock-title">Shock #{shockNumber} — select energy</p>
      <div className="energy-presets" role="group" aria-label="Shock energy">
        {presets.map((energy) => (
          <button
            key={energy}
            type="button"
            className={`energy-preset ${energy === selectedJoules ? 'selected' : ''} ${energy === defaultJoules ? 'recommended' : ''}`}
            aria-pressed={energy === selectedJoules}
            onClick={() => setSelectedJoules(energy)}
          >
            {energy}J
          </button>
        ))}
      </div>
      <div className="shock-actions">
        <button
          type="button"
          className="btn btn-primary btn-lg btn-touch"
          onClick={() => onSelect(selectedJoules)}
        >
          Shock delivered
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary btn-lg btn-touch" onClick={onCancel}>
            Back
          </button>
        )}
      </div>
    </div>
  )
}

export { formatRhythmLogLabel }

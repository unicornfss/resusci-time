import { PREVIEW_SPEED_OPTIONS, type PreviewSpeedMultiplier } from '../previewSpeed'

interface PreviewSpeedControlProps {
  value: PreviewSpeedMultiplier
  onChange: (speed: PreviewSpeedMultiplier) => void
}

export function PreviewSpeedControl({ value, onChange }: PreviewSpeedControlProps) {
  return (
    <label className="preview-speed-control">
      <span className="preview-speed-label">Preview speed</span>
      <select
        className="preview-speed-select"
        value={value}
        aria-label="Preview protocol speed"
        onChange={(event) => onChange(Number(event.target.value) as PreviewSpeedMultiplier)}
      >
        {PREVIEW_SPEED_OPTIONS.map((speed) => (
          <option key={speed} value={speed}>
            {speed}×{speed === 1 ? ' (real time)' : ''}
          </option>
        ))}
      </select>
    </label>
  )
}

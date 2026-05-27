interface InterventionOtherFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onCancel: () => void
}

export function InterventionOtherForm({
  value,
  onChange,
  onSubmit,
  onCancel,
}: InterventionOtherFormProps) {
  return (
    <div className="intervention-other-form">
      <label className="intervention-other-label" htmlFor="intervention-other-input">
        Describe intervention
      </label>
      <input
        id="intervention-other-input"
        type="text"
        className="intervention-other-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter details"
        autoComplete="off"
      />
      <div className="intervention-other-actions">
        <button
          type="button"
          className="btn btn-primary btn-touch"
          onClick={onSubmit}
          disabled={!value.trim()}
        >
          Log
        </button>
        <button type="button" className="btn btn-secondary btn-touch" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}

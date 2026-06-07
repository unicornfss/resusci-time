import type { FormEvent } from 'react'

interface InterventionOtherFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  onCancel: () => void
  placeholder?: string
}

export function InterventionOtherForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = 'Enter details',
}: InterventionOtherFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <form className="intervention-other-form" onSubmit={handleSubmit}>
      <label className="intervention-other-label" htmlFor="intervention-other-input">
        Describe intervention
      </label>
      <input
        id="intervention-other-input"
        type="text"
        className="intervention-other-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <div className="intervention-other-actions">
        <button type="submit" className="btn btn-primary btn-touch" disabled={!value.trim()}>
          Log
        </button>
        <button type="button" className="btn btn-secondary btn-touch" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

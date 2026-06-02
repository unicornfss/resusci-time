import { useRef, type ChangeEvent } from 'react'
import { parseCaseHandoffFile, type CaseHandoffPayload } from '../caseHandoff'

interface OpenHandoffFileButtonProps {
  onPayload: (payload: CaseHandoffPayload) => void
  className?: string
}

/** For handoffs received as a file (e.g. Android Bluetooth share). */
export function OpenHandoffFileButton({ onPayload, className }: OpenHandoffFileButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const parsed = await parseCaseHandoffFile(file)
    if (parsed) {
      onPayload(parsed)
      return
    }
    window.alert('Could not read that handoff file. Check it is a Resusci-Time case transfer.')
  }

  return (
    <>
      <button
        type="button"
        className={className ?? 'btn btn-secondary btn-sm'}
        onClick={() => fileInputRef.current?.click()}
      >
        Open handoff file
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        onChange={(event) => void handleFileChange(event)}
      />
    </>
  )
}

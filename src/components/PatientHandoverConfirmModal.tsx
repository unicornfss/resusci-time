import type { MouseEvent } from 'react'

interface PatientHandoverConfirmModalProps {
  showTransferCase: boolean
  onCancel: () => void
  onConfirmHandover: () => void
  onTransferCase: () => void
}

export function PatientHandoverConfirmModal({
  showTransferCase,
  onCancel,
  onConfirmHandover,
  onTransferCase,
}: PatientHandoverConfirmModalProps) {
  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onCancel()
  }

  return (
    <div
      className="about-modal patient-handover-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-handover-title"
      onClick={handleBackdropClick}
    >
      <div className="about-panel card">
        <div className="about-header">
          <h2 id="patient-handover-title">Confirm patient handover</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
            Close
          </button>
        </div>

        <div className="about-body">
          <p>
            {showTransferCase ? (
              <>
                Confirm the patient has been handed over to hospital staff or another healthcare
                provider who is <strong>not</strong> using Resusci-Time.
              </>
            ) : (
              <>
                Confirm the patient has been handed over to hospital staff or another healthcare
                provider.
              </>
            )}
          </p>
          <p>
            This will <strong>stop all timers</strong> and <strong>end logging</strong> for this case
            on this device. The event log will remain available to view or export.
          </p>

          {showTransferCase && (
            <div className="patient-handover-transfer-note">
              <p>
                Handing over to another ambulance crew who <strong>are</strong> using
                Resusci-Time? Use <strong>Transfer case</strong> instead so they can continue the
                live case on their device.
              </p>
              <button type="button" className="btn btn-secondary btn-lg" onClick={onTransferCase}>
                Transfer case
              </button>
            </div>
          )}

          <div className="case-continuation-actions patient-handover-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={onConfirmHandover}>
              Confirm patient handed over
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

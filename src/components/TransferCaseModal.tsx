import { useEffect, useState, type MouseEvent } from 'react'
import QRCode from 'qrcode'
import {
  buildCaseHandoffUrl,
  CASE_HANDOFF_PRIVACY_NOTE,
  isHandoffUrlTooLargeForQr,
  type CaseHandoffPayload,
} from '../caseHandoff'

interface TransferCaseModalProps {
  payload: CaseHandoffPayload
  onResumeCase: () => void
  onConfirmTransferred: () => void
}

export function TransferCaseModal({
  payload,
  onResumeCase,
  onConfirmTransferred,
}: TransferCaseModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [tooLargeForQr, setTooLargeForQr] = useState(false)

  useEffect(() => {
    const url = buildCaseHandoffUrl(payload)
    const tooLarge = isHandoffUrlTooLargeForQr(url)
    setTooLargeForQr(tooLarge)

    if (!tooLarge) {
      QRCode.toDataURL(url, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 280,
      })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null))
    } else {
      setQrDataUrl(null)
    }
  }, [payload])

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onResumeCase()
  }

  return (
    <div
      className="about-modal transfer-case-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-case-title"
      onClick={handleBackdropClick}
    >
      <div className="about-panel card">
        <div className="about-header">
          <h2 id="transfer-case-title">Transfer case</h2>
        </div>

        <div className="about-body">
          <p className="share-log-intro">
            The timer is paused while this screen is open. Scan the QR code on the other device.
            When it has taken over, tap <strong>Case transferred</strong>.
          </p>

          {tooLargeForQr ? (
            <p className="share-log-warning" role="status">
              This case is too long for a reliable QR code — continue on this device or start a
              shorter case to transfer.
            </p>
          ) : (
            qrDataUrl && (
              <div className="share-log-qr-wrap">
                <img
                  className="share-log-qr"
                  src={qrDataUrl}
                  alt="QR code to transfer active case"
                />
              </div>
            )
          )}

          <div className="case-continuation-actions transfer-case-confirm-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={onConfirmTransferred}>
              Case transferred
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={onResumeCase}>
              Resume case
            </button>
          </div>

          <p className="about-note">{CASE_HANDOFF_PRIVACY_NOTE}</p>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import QRCode from 'qrcode'
import { copyTextToClipboard, isClipboardLikelyBlocked } from '../clipboard'
import {
  buildCaseHandoffUrl,
  canInvokeWebShare,
  CASE_HANDOFF_PRIVACY_NOTE,
  createHandoffShareFile,
  getHandoffShareBlockReason,
  HANDOFF_NEEDS_HTTPS_HINT,
  HANDOFF_SHARE_UNSUPPORTED_HINT,
  isHandoffUrlTooLargeForQr,
  shareHandoff,
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
  const [handoffUrl, setHandoffUrl] = useState('')
  const [tooLargeForQr, setTooLargeForQr] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed' | 'select'>('idle')
  const [shareState, setShareState] = useState<'idle' | 'shared' | 'failed' | 'cancelled'>('idle')
  const linkInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const url = buildCaseHandoffUrl(payload)
    setHandoffUrl(url)
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

  async function handleCopyLink(): Promise<boolean> {
    const copied = await copyTextToClipboard(handoffUrl)
    if (copied) {
      setCopyState('copied')
      return true
    }

    setShowLink(true)
    linkInputRef.current?.focus()
    linkInputRef.current?.select()
    setCopyState(isClipboardLikelyBlocked() ? 'select' : 'failed')
    return false
  }

  async function handleShare() {
    setShareState('idle')

    if (!canInvokeWebShare()) {
      const copied = await handleCopyLink()
      const blockReason = getHandoffShareBlockReason()
      const hint =
        blockReason === 'needs-https' ? HANDOFF_NEEDS_HTTPS_HINT : HANDOFF_SHARE_UNSUPPORTED_HINT
      window.alert(
        copied
          ? `${hint}\n\nThe handoff link has been copied — paste it into the browser on the other device.`
          : hint,
      )
      return
    }

    const file = createHandoffShareFile(payload)
    const result = await shareHandoff(handoffUrl, file)
    if (result === 'shared-url' || result === 'shared-file') setShareState('shared')
    else if (result === 'cancelled') setShareState('cancelled')
    else if (result === 'failed') {
      setShareState('failed')
      await handleCopyLink()
    }
  }

  const copyLabel =
    copyState === 'copied'
      ? 'Copied'
      : copyState === 'select'
        ? 'Select link'
        : copyState === 'failed'
          ? 'Copy failed'
          : 'Copy link'

  const shareLabel =
    shareState === 'shared'
      ? 'Shared'
      : shareState === 'failed'
        ? 'Share failed — link copied'
        : 'Share to other device'

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
            The timer is paused while this screen is open. Use <strong>Share</strong> or scan the
            QR code on the other device. When it has taken over, tap <strong>Case transferred</strong>.
          </p>

          <div className="transfer-case-share-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => void handleShare()}>
              {shareLabel}
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => void handleCopyLink()}>
              {copyLabel}
            </button>
          </div>

          <p className="log-export-hint" role="status">
            Share opens your device&apos;s system menu (Bluetooth may appear on phones). If Share
            is unavailable, use Copy link or the QR code. After a file share, the other device uses{' '}
            <strong>Open handoff file</strong> in the header.
          </p>

          {tooLargeForQr ? (
            <p className="share-log-warning" role="status">
              This case is too long for a reliable QR code — use <strong>Share</strong> or{' '}
              <strong>Copy link</strong>.
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

          {(showLink || copyState !== 'idle') && (
            <div className="share-log-link-row">
              <input
                ref={linkInputRef}
                className="share-log-link-input"
                type="text"
                readOnly
                value={handoffUrl}
                aria-label="Case handoff link"
                onFocus={(event) => event.target.select()}
              />
            </div>
          )}

          {!showLink && copyState === 'idle' && (
            <button
              type="button"
              className="btn btn-secondary btn-sm transfer-case-show-link-btn"
              onClick={() => setShowLink(true)}
            >
              Show link to paste manually
            </button>
          )}

          {copyState === 'select' && (
            <p className="log-export-hint" role="status">
              Link selected — press Ctrl+C (or long-press Copy) to copy.
            </p>
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

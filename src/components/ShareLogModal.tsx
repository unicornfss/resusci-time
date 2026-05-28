import { useEffect, useRef, useState, type MouseEvent } from 'react'
import QRCode from 'qrcode'
import { copyTextToClipboard, isClipboardLikelyBlocked } from '../clipboard'
import { serviceConfig } from '../config'
import {
  buildSharePayload,
  buildShareUrl,
  isShareUrlTooLargeForQr,
  SHARE_LINK_PRIVACY_NOTE,
} from '../logShare'
import type { DisplayLogEntry } from '../types'

interface ShareLogModalProps {
  entries: readonly DisplayLogEntry[]
  documentTitle: string
  onClose: () => void
}

export function ShareLogModal({ entries, documentTitle, onClose }: ShareLogModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState('')
  const [tooLargeForQr, setTooLargeForQr] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed' | 'select'>('idle')
  const linkInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const payload = buildSharePayload(entries, serviceConfig.trustId)
    const url = buildShareUrl(payload)
    setShareUrl(url)
    const tooLarge = isShareUrlTooLargeForQr(url)
    setTooLargeForQr(tooLarge)

    if (!tooLarge) {
      QRCode.toDataURL(url, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 280,
      })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null))
    }
  }, [entries])

  async function handleCopyLink() {
    const copied = await copyTextToClipboard(shareUrl)
    if (copied) {
      setCopyState('copied')
      return
    }

    linkInputRef.current?.focus()
    linkInputRef.current?.select()
    setCopyState(isClipboardLikelyBlocked() ? 'select' : 'failed')
  }

  const copyLabel =
    copyState === 'copied'
      ? 'Copied'
      : copyState === 'select'
        ? 'Select link'
        : copyState === 'failed'
          ? 'Copy failed'
          : 'Copy link'

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div
      className="about-modal share-log-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-log-title"
      onClick={handleBackdropClick}
    >
      <div className="about-panel card">
        <div className="about-header">
          <h2 id="share-log-title">Share log</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="about-body">
          <p className="share-log-intro">
            The full log is encoded in the link or QR code — nothing is stored on a server. The
            link keeps working after you close this tab; anyone with it can view the log in their
            browser.
          </p>

          {tooLargeForQr ? (
            <p className="share-log-warning" role="status">
              This log is too long for a reliable QR code. Copy the link below instead, or download
              CSV/PDF.
            </p>
          ) : (
            qrDataUrl && (
              <div className="share-log-qr-wrap">
                <img className="share-log-qr" src={qrDataUrl} alt={`QR code to share ${documentTitle} log`} />
              </div>
            )
          )}

          <div className="share-log-link-row">
            <input
              ref={linkInputRef}
              className="share-log-link-input"
              type="text"
              readOnly
              value={shareUrl}
              aria-label="Share link"
              onFocus={(event) => event.target.select()}
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => void handleCopyLink()}>
              {copyLabel}
            </button>
          </div>

          {copyState === 'select' && (
            <p className="log-export-hint" role="status">
              Link selected — press Ctrl+C to copy. Clipboard is restricted on this connection; use
              localhost or HTTPS for one-click copy.
            </p>
          )}

          <p className="about-note">{SHARE_LINK_PRIVACY_NOTE}</p>
          <p className="about-note">
            Anyone with the link or QR can read the full log. Only share with people who need it for
            clinical handover or record-keeping.
          </p>
        </div>
      </div>
    </div>
  )
}

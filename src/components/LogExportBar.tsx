import { useState } from 'react'
import { downloadLogCsv, downloadLogPdf, shareLogViaEmail } from '../logExport'
import type { DisplayLogEntry } from '../types'
import { ShareLogModal } from './ShareLogModal'

interface LogExportBarProps {
  entries: readonly DisplayLogEntry[]
  documentTitle: string
}

export function LogExportBar({ entries, documentTitle }: LogExportBarProps) {
  const [shareOpen, setShareOpen] = useState(false)
  const [emailState, setEmailState] = useState<'idle' | 'working' | 'eml'>('idle')

  async function handleEmailShare() {
    setEmailState('working')
    const result = await shareLogViaEmail(entries, documentTitle)
    if (result === 'eml-csv') {
      setEmailState('eml')
      window.setTimeout(() => setEmailState('idle'), 8000)
    } else {
      setEmailState('idle')
    }
  }

  const emailLabel =
    emailState === 'working'
      ? '…'
      : emailState === 'eml'
        ? 'Open .eml'
        : 'Email'

  return (
    <>
      <div className="log-export-bar">
        <button
          type="button"
          className="btn btn-secondary btn-sm log-export-btn"
          onClick={() => downloadLogCsv(entries, documentTitle)}
        >
          CSV
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm log-export-btn"
          onClick={() => void downloadLogPdf(entries, documentTitle)}
        >
          PDF
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm log-export-btn"
          onClick={() => void handleEmailShare()}
          disabled={emailState === 'working'}
        >
          {emailLabel}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm log-export-btn"
          onClick={() => setShareOpen(true)}
        >
          Share QR
        </button>
      </div>
      {emailState === 'eml' && (
        <p className="log-export-hint" role="status">
          An .eml file was downloaded — open it in Outlook (or your email app) to send with the CSV
          attached.
        </p>
      )}
      {shareOpen && (
        <ShareLogModal
          entries={entries}
          documentTitle={documentTitle}
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  )
}

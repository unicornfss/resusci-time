import { useState } from 'react'
import { serviceConfig } from '../config'
import { downloadLogCsv, downloadLogPdf, shareLogViaEmail } from '../logExport'
import { isLogStorageAvailable, saveLogToDevice, type SavedLogMeta } from '../logStorage'
import type { DisplayLogEntry } from '../types'
import { ShareLogModal } from './ShareLogModal'

interface LogExportBarProps {
  entries: readonly DisplayLogEntry[]
  documentTitle: string
  saveMeta?: SavedLogMeta
}

export function LogExportBar({ entries, documentTitle, saveMeta }: LogExportBarProps) {
  const [shareOpen, setShareOpen] = useState(false)
  const [emailState, setEmailState] = useState<'idle' | 'working' | 'eml'>('idle')
  const [saveState, setSaveState] = useState<'idle' | 'working' | 'saved' | 'failed'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

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

  async function handleSaveToDevice() {
    if (!isLogStorageAvailable()) {
      setSaveError('This browser blocked on-device storage.')
      setSaveState('failed')
      window.setTimeout(() => {
        setSaveState('idle')
        setSaveError(null)
      }, 5000)
      return
    }

    setSaveState('working')
    setSaveError(null)
    try {
      await saveLogToDevice({
        trustId: serviceConfig.trustId,
        documentTitle,
        entries,
        meta: saveMeta,
      })
      setSaveState('saved')
      window.setTimeout(() => setSaveState('idle'), 2500)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Save failed.')
      setSaveState('failed')
      window.setTimeout(() => {
        setSaveState('idle')
        setSaveError(null)
      }, 5000)
    }
  }

  const emailLabel =
    emailState === 'working'
      ? '…'
      : emailState === 'eml'
        ? 'Open .eml'
        : 'Email'

  const saveLabel =
    saveState === 'working'
      ? '…'
      : saveState === 'saved'
        ? 'Saved'
        : saveState === 'failed'
          ? 'Failed'
          : 'Save'

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
          onClick={() => void handleSaveToDevice()}
          disabled={saveState === 'working'}
        >
          {saveLabel}
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
      {saveState === 'failed' && saveError && (
        <p className="log-export-hint" role="status">
          {saveError}
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

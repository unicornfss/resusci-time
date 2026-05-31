import { useState, type MouseEvent } from 'react'
import { serviceConfig } from '../config'
import {
  getProtocolDocument,
  getProtocolDocuments,
  type ProtocolDocumentId,
} from '../documents'
import { publicAssetUrl } from '../publicAssetUrl'

interface DocumentsModalProps {
  onClose: () => void
}

export function DocumentsModal({ onClose }: DocumentsModalProps) {
  const { trustId } = serviceConfig
  const documents = getProtocolDocuments(trustId)
  const [selectedId, setSelectedId] = useState<ProtocolDocumentId | null>(null)
  const selected = selectedId ? getProtocolDocument(selectedId, trustId) : null

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  function handleBack() {
    setSelectedId(null)
  }

  return (
    <div
      className="documents-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={selected ? 'document-viewer-title' : 'documents-list-title'}
      onClick={handleBackdropClick}
    >
      <div className="documents-panel card">
        {selected ? (
          <>
            <div className="documents-header">
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleBack}>
                Back
              </button>
              <h2 id="document-viewer-title">{selected.title}</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Close
              </button>
            </div>
            <div className="document-viewer-body">
              {selected.type === 'image' && (
                <img
                  className="document-viewer-image"
                  src={publicAssetUrl(selected.asset)}
                  alt={selected.title}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <div className="documents-header">
              <h2 id="documents-list-title">Documents</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Close
              </button>
            </div>
            <ul className="documents-list">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    className="documents-list-item"
                    onClick={() => setSelectedId(doc.id)}
                  >
                    {doc.title}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

import {
  RESUSCITATION_QUALITY_HEADER,
  RESUSCITATION_QUALITY_ITEMS,
  type ResuscitationQualityPromptId,
} from '../protocol'
import { REVERSIBLE_CAUSES } from '../reversibleCauses'
import type { ReversibleCauseId } from '../reversibleCauses'

interface ResuscitationQualityChecklistProps {
  completedIds: ReadonlySet<ResuscitationQualityPromptId>
  completedReversibleCauseIds: ReadonlySet<ReversibleCauseId>
  onLogPrompt: (id: ResuscitationQualityPromptId, label: string) => void
  onOpenVascularAccess: () => void
  onOpenAirwayInterventions: () => void
  onOpenReversibleCauses: () => void
  showHeader?: boolean
  showCommenceLine?: boolean
}

export function ResuscitationQualityChecklist({
  completedIds,
  completedReversibleCauseIds,
  onLogPrompt,
  onOpenVascularAccess,
  onOpenAirwayInterventions,
  onOpenReversibleCauses,
  showHeader = true,
  showCommenceLine = false,
}: ResuscitationQualityChecklistProps) {
  function handleToggle(
    id: ResuscitationQualityPromptId,
    label: string,
    action: 'log' | 'vascular-access' | 'airway-interventions' | 'reversible-causes',
  ) {
    if (completedIds.has(id)) return
    if (action === 'vascular-access') {
      onOpenVascularAccess()
      return
    }
    if (action === 'airway-interventions') {
      onOpenAirwayInterventions()
      return
    }
    if (action === 'reversible-causes') {
      onOpenReversibleCauses()
      return
    }
    onLogPrompt(id, label)
  }

  function renderReversibleCausesPill() {
    return (
      <button
        type="button"
        className="reversible-causes-pill"
        aria-label="Open reversible causes checklist"
        onClick={(e) => {
          e.stopPropagation()
          onOpenReversibleCauses()
        }}
      >
        {REVERSIBLE_CAUSES.map((cause) => (
          <span
            key={cause.id}
            className={
              completedReversibleCauseIds.has(cause.id)
                ? 'reversible-causes-pill-letter reversible-causes-pill-letter-done'
                : 'reversible-causes-pill-letter'
            }
          >
            {cause.letter}
          </span>
        ))}
      </button>
    )
  }

  return (
    <div className="resuscitation-prompt">
      {showCommenceLine && (
        <p>
          <strong>Commence high quality resuscitation.</strong>
        </p>
      )}
      {showHeader && <p>{RESUSCITATION_QUALITY_HEADER}</p>}
      <ul className="quality-prompt-checklist">
        {RESUSCITATION_QUALITY_ITEMS.map((item) => {
          const done = completedIds.has(item.id)
          if (item.id === 'reversible-causes') {
            return (
              <li key={item.id} className={done ? 'quality-prompt-done' : ''}>
                <div className="quality-prompt-item quality-prompt-item-with-pill">
                  <label className="quality-prompt-item-main">
                    <input
                      type="checkbox"
                      className="quality-prompt-checkbox"
                      checked={done}
                      disabled={done}
                      onChange={() => handleToggle(item.id, item.label, item.action)}
                    />
                    <span className="quality-prompt-label">{item.label}</span>
                  </label>
                  {renderReversibleCausesPill()}
                </div>
              </li>
            )
          }
          return (
            <li key={item.id} className={done ? 'quality-prompt-done' : ''}>
              <label className="quality-prompt-item">
                <input
                  type="checkbox"
                  className="quality-prompt-checkbox"
                  checked={done}
                  disabled={done}
                  onChange={() => handleToggle(item.id, item.label, item.action)}
                />
                <span className="quality-prompt-label">{item.label}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

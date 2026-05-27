import {
  ROSC_TASK_ITEMS,
  isRoscTaskComplete,
  type RoscTaskId,
} from '../roscTasks'
import { REVERSIBLE_CAUSES, type ReversibleCauseId } from '../reversibleCauses'

interface RoscChecklistProps {
  completedTaskIds: ReadonlySet<RoscTaskId>
  completedReversibleCauseIds: ReadonlySet<ReversibleCauseId>
  onLogTask: (id: RoscTaskId, label: string) => void
  onOpenReversibleCauses: () => void
}

export function RoscChecklist({
  completedTaskIds,
  completedReversibleCauseIds,
  onLogTask,
  onOpenReversibleCauses,
}: RoscChecklistProps) {
  function handleToggle(id: RoscTaskId, label: string, action: 'log' | 'reversible-causes') {
    if (isRoscTaskComplete(id, completedTaskIds, completedReversibleCauseIds)) return
    if (action === 'reversible-causes') {
      onOpenReversibleCauses()
      return
    }
    onLogTask(id, label)
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
    <div className="resuscitation-prompt rosc-checklist">
      <p>
        <strong>Post-ROSC care</strong>
      </p>
      <ul className="quality-prompt-checklist">
        {ROSC_TASK_ITEMS.map((item) => {
          const done = isRoscTaskComplete(item.id, completedTaskIds, completedReversibleCauseIds)
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
                      onChange={() =>
                        handleToggle(item.id, item.label, item.action ?? 'log')
                      }
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
                  onChange={() => handleToggle(item.id, item.label, item.action ?? 'log')}
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

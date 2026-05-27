import {
  REVERSIBLE_CAUSE_H_ITEMS,
  REVERSIBLE_CAUSE_T_ITEMS,
  type ReversibleCauseId,
} from '../reversibleCauses'

interface ReversibleCausesModalProps {
  completedIds: ReadonlySet<ReversibleCauseId>
  onToggle: (id: ReversibleCauseId) => void
  onClose: () => void
}

function ReversibleCauseColumn({
  items,
  completedIds,
  onToggle,
}: {
  items: typeof REVERSIBLE_CAUSE_H_ITEMS
  completedIds: ReadonlySet<ReversibleCauseId>
  onToggle: (id: ReversibleCauseId) => void
}) {
  return (
    <ul className="reversible-causes-list">
      {items.map((item) => {
        const done = completedIds.has(item.id)
        return (
          <li key={item.id} className={done ? 'reversible-causes-item-done' : ''}>
            <label className="reversible-causes-item">
              <input
                type="checkbox"
                className="reversible-causes-checkbox"
                checked={done}
                disabled={done}
                onChange={() => onToggle(item.id)}
              />
              <span className="reversible-causes-label">{item.label}</span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}

export function ReversibleCausesModal({
  completedIds,
  onToggle,
  onClose,
}: ReversibleCausesModalProps) {
  return (
    <div
      className="reversible-causes-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reversible-causes-title"
    >
      <div className="reversible-causes-panel card">
        <div className="reversible-causes-header">
          <h2 id="reversible-causes-title">Address reversible causes</h2>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="reversible-causes-columns">
          <ReversibleCauseColumn items={REVERSIBLE_CAUSE_H_ITEMS} completedIds={completedIds} onToggle={onToggle} />
          <ReversibleCauseColumn items={REVERSIBLE_CAUSE_T_ITEMS} completedIds={completedIds} onToggle={onToggle} />
        </div>
      </div>
    </div>
  )
}

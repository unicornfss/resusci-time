import { useEffect, useState } from 'react'
import {
  INITIAL_ASSESSMENT_OPTIONS,
  isObviouslyDeceasedObservationCriterion,
  OBVIOUSLY_DECEASED_CRITERIA,
  type InitialAssessmentItemId,
  type ObviouslyDeceasedCriterionId,
  type VodObservationChecklistId,
  VOD_OBSERVATION_CHECKLIST_HEADER,
  VOD_OBSERVATION_CHECKLIST_ITEMS,
} from '../protocol'
import { useTimingConfig } from '../context/TimingConfigContext'
import { getVodCountdownRemainingFraction } from '../timing'

export type InitialAssessmentMode = 'initial' | 'tor-reassessment'

interface InitialAssessmentPanelProps {
  mode?: InitialAssessmentMode
  onCommenceResuscitation: () => void
  onCompleteVod: (criteriaLabels: string[]) => void
  onLogObservationCriteria: (criteriaLabels: string[]) => void
  formatCountdown: (actualSeconds: number) => string
  onCancel?: () => void
}

type AssessmentPhase = 'list' | 'commence-command'

const OBVIOUSLY_DECEASED_ID: InitialAssessmentItemId = 'obviously-deceased'

function toggleSetItem<T>(set: Set<T>, item: T): Set<T> {
  const next = new Set(set)
  if (next.has(item)) next.delete(item)
  else next.add(item)
  return next
}

export function InitialAssessmentPanel({
  mode = 'initial',
  onCommenceResuscitation,
  onCompleteVod,
  onLogObservationCriteria,
  formatCountdown,
  onCancel,
}: InitialAssessmentPanelProps) {
  const { timing } = useTimingConfig()
  const isTorReassessment = mode === 'tor-reassessment'
  const [selectedMainIds, setSelectedMainIds] = useState<Set<InitialAssessmentItemId>>(() => new Set())
  const [selectedObviousIds, setSelectedObviousIds] = useState<Set<ObviouslyDeceasedCriterionId>>(
    () => new Set(),
  )
  const [phase, setPhase] = useState<AssessmentPhase>('list')
  const [observationActive, setObservationActive] = useState(false)
  const [observationCountdown, setObservationCountdown] = useState(timing.vodCountdownActualSeconds)
  const [observationChecklist, setObservationChecklist] = useState<Set<VodObservationChecklistId>>(
    () => new Set(),
  )

  const obviouslyExpanded = selectedMainIds.has(OBVIOUSLY_DECEASED_ID)
  const observationExpired = observationCountdown <= 0
  const directVodLabels = getDirectVodLabels(selectedMainIds, selectedObviousIds)
  const observationLabels = getObservationLabels(selectedObviousIds)
  const allSelectedVodLabels = [...directVodLabels, ...observationLabels]
  const requiresAsystoleObservation =
    observationLabels.length > 0 && directVodLabels.length === 0
  const allObservationChecked =
    observationChecklist.size === VOD_OBSERVATION_CHECKLIST_ITEMS.length

  useEffect(() => {
    if (!observationActive || observationExpired) return
    const id = window.setInterval(() => {
      setObservationCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [observationActive, observationExpired])

  function handleMainSelect(id: InitialAssessmentItemId) {
    if (phase !== 'list' && phase !== 'commence-command') return
    if (phase === 'commence-command') setPhase('list')

    setSelectedMainIds((prev) => {
      const next = toggleSetItem(prev, id)
      if (!next.has(OBVIOUSLY_DECEASED_ID)) {
        setSelectedObviousIds(new Set())
        resetObservation()
      } else if (id !== OBVIOUSLY_DECEASED_ID && next.has(id)) {
        resetObservation()
      }
      return next
    })
  }

  function handleObviousCriterionSelect(id: ObviouslyDeceasedCriterionId) {
    if (phase !== 'list' || !selectedMainIds.has(OBVIOUSLY_DECEASED_ID) || observationActive) return

    setSelectedObviousIds((prev) => {
      const wasSelected = prev.has(id)
      const next = toggleSetItem(prev, id)
      if (!wasSelected && !isObviouslyDeceasedObservationCriterion(id)) {
        resetObservation()
      }
      if (wasSelected && isObviouslyDeceasedObservationCriterion(id)) {
        resetObservation()
      }
      return next
    })
  }

  function resetObservation() {
    setObservationActive(false)
    setObservationCountdown(timing.vodCountdownActualSeconds)
    setObservationChecklist(new Set())
  }

  function clearAllVodSelections() {
    setSelectedMainIds((prev) => {
      const next = new Set(prev)
      for (const id of prev) {
        if (id !== OBVIOUSLY_DECEASED_ID) next.delete(id)
      }
      return next
    })
    setSelectedObviousIds(new Set())
    resetObservation()
  }

  function confirmDirectVod() {
    onCompleteVod(allSelectedVodLabels)
  }

  function startObservation() {
    setObservationCountdown(timing.vodCountdownActualSeconds)
    setObservationChecklist(new Set())
    setObservationActive(true)
    onLogObservationCriteria(observationLabels)
  }

  function handleAsystoleNo() {
    setSelectedObviousIds(new Set())
    resetObservation()
    setPhase('commence-command')
  }

  function toggleObservationItem(itemId: VodObservationChecklistId) {
    if (!observationExpired) return
    setObservationChecklist((prev) => toggleSetItem(prev, itemId))
  }

  function renderUnifiedConfirmPanel() {
    const hasPending = allSelectedVodLabels.length > 0
    if (!hasPending || phase !== 'list' || observationActive) return null

    if (requiresAsystoleObservation) {
      return (
        <div className="assessment-combined-confirm assessment-confirm-panel" role="status">
          <p>
            Confirm the patient is in <strong>asystole</strong> for:
          </p>
          <ul className="assessment-confirm-list">
            {observationLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
          <div className="actions">
            <button type="button" className="btn btn-danger btn-lg" onClick={startObservation}>
              Yes — in asystole
            </button>
            <button type="button" className="btn btn-primary btn-lg" onClick={handleAsystoleNo}>
              No — not in asystole
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="assessment-combined-confirm assessment-confirm-panel" role="status">
        <p>Confirm the following</p>
        <ul className="assessment-confirm-list">
          {allSelectedVodLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
        <div className="actions">
          <button type="button" className="btn btn-danger btn-lg" onClick={confirmDirectVod}>
            Yes — confirm
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={clearAllVodSelections}>
            No — go back
          </button>
        </div>
      </div>
    )
  }

  function renderObservationTimerBox() {
    const progressFraction = getVodCountdownRemainingFraction(
      observationCountdown,
      timing.vodCountdownActualSeconds,
    )

    return (
      <div className="assessment-observation-timer-box" role="status" aria-live="polite">
        <div className="assessment-observation-timer-top">
          <div className="timer-display">
            <span className="timer-label">Observation</span>
            <span className="timer-value">{formatCountdown(observationCountdown)}</span>
          </div>
        </div>
        <div
          className="rhythm-check-progress-track assessment-observation-progress-track"
          role="progressbar"
          aria-label="Observation period remaining"
          aria-valuemin={0}
          aria-valuemax={timing.vodCountdownActualSeconds}
          aria-valuenow={observationCountdown}
        >
          <div
            className="rhythm-check-progress-fill"
            style={{ width: `${progressFraction * 100}%` }}
          />
        </div>
        <p className="assessment-observation-wait-hint">
          Confirm each item when the 5-minute observation period ends.
        </p>
      </div>
    )
  }

  function renderObservationChecklist() {
    return (
      <>
        {observationExpired && (
          <p className="assessment-observation-complete" role="status">
            5-minute observation period complete
          </p>
        )}
        <p className="assessment-observation-header">{VOD_OBSERVATION_CHECKLIST_HEADER}</p>
        <ul className="quality-prompt-checklist">
          {VOD_OBSERVATION_CHECKLIST_ITEMS.map((item) => {
            const done = observationChecklist.has(item.id)
            const itemDisabled = !observationExpired
            return (
              <li
                key={item.id}
                className={`${done ? 'quality-prompt-done' : ''}${itemDisabled ? ' assessment-checklist-locked' : ''}`}
              >
                <label className="quality-prompt-item">
                  <input
                    type="checkbox"
                    className="quality-prompt-checkbox"
                    checked={done}
                    disabled={itemDisabled}
                    onChange={() => toggleObservationItem(item.id)}
                  />
                  <span className="quality-prompt-label">{item.label}</span>
                </label>
              </li>
            )
          })}
        </ul>
        <button
          type="button"
          className="btn btn-danger btn-lg assessment-vod-btn"
          disabled={!observationExpired || !allObservationChecked}
          onClick={() => onCompleteVod([])}
        >
          VOD
        </button>
      </>
    )
  }

  function renderObservationFlow() {
    if (!observationActive || !requiresAsystoleObservation) return null

    return (
      <div className="assessment-observation-panel">
        <p className="assessment-observation-criterion">Selected criteria:</p>
        <ul className="assessment-confirm-list">
          {observationLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
        {!observationExpired && renderObservationTimerBox()}
        {renderObservationChecklist()}
      </div>
    )
  }

  function renderObviouslySubList() {
    return (
      <ul className="assessment-tree-sublist" role="group" aria-label="Obviously deceased criteria">
        {OBVIOUSLY_DECEASED_CRITERIA.map((criterion) => {
          const selected = selectedObviousIds.has(criterion.id)
          return (
            <li key={criterion.id} className="assessment-tree-node assessment-tree-node-sub">
              <button
                type="button"
                className={`assessment-tree-row assessment-tree-row-sub${selected ? ' selected' : ''}`}
                disabled={observationActive}
                onClick={() => handleObviousCriterionSelect(criterion.id)}
              >
                <span className="assessment-tree-icon" aria-hidden="true">
                  ○
                </span>
                <span className="assessment-tree-check" aria-hidden="true">
                  {selected ? '✓' : ''}
                </span>
                <span className="assessment-tree-label">{criterion.label}</span>
                {!observationActive && <span className="assessment-tree-hint">Tap to select</span>}
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  const showObservationFlow = observationActive && requiresAsystoleObservation

  return (
    <section className="card">
      <div className="card-badge">{isTorReassessment ? 'TOR re-assessment' : 'Initial assessment'}</div>

      {showObservationFlow ? (
        <>
          <h2>Asystole observation</h2>
          {renderObservationFlow()}
        </>
      ) : (
        <>
          <h2>Any of the following identified?</h2>
          <p className="assessment-tap-hint">
            {isTorReassessment
              ? 'Re-assess before termination review. More information may have come to light since resuscitation began. Tap options to select one or more.'
              : 'Tap options to select one or more. Expandable items show sub-criteria below.'}
          </p>

          <ul className="assessment-tree" role="tree">
            {INITIAL_ASSESSMENT_OPTIONS.map((option) => {
              const selected = selectedMainIds.has(option.id)
              const isObviously = option.id === OBVIOUSLY_DECEASED_ID
              const expanded = isObviously && obviouslyExpanded

              return (
                <li
                  key={option.id}
                  className={`assessment-tree-node${selected ? ' is-selected' : ''}${expanded ? ' is-expanded' : ''}`}
                  role="treeitem"
                  aria-expanded={isObviously ? expanded : undefined}
                >
                  <button
                    type="button"
                    className={`assessment-tree-row${selected ? ' selected' : ''}${isObviously ? ' is-branch' : ''}`}
                    onClick={() => handleMainSelect(option.id)}
                  >
                    <span className="assessment-tree-icon" aria-hidden="true">
                      {isObviously ? (expanded ? '▼' : '▶') : '○'}
                    </span>
                    <span className="assessment-tree-check" aria-hidden="true">
                      {selected ? '✓' : ''}
                    </span>
                    <span className="assessment-tree-label">{option.label}</span>
                    <span className="assessment-tree-hint">Tap to select</span>
                  </button>

                  {isObviously && obviouslyExpanded && (
                    <div className="assessment-tree-children">{renderObviouslySubList()}</div>
                  )}
                </li>
              )
            })}
          </ul>

          {renderUnifiedConfirmPanel()}

          {phase === 'commence-command' && (
            <div className="assessment-confirm-panel assessment-commence-panel" role="status">
              <p>
                {isTorReassessment ? (
                  <>
                    <strong>Continue to termination review.</strong> Patient is not in asystole.
                  </>
                ) : (
                  <>
                    <strong>Commence resuscitation immediately.</strong> Patient is not in asystole.
                  </>
                )}
              </p>
              <button type="button" className="btn btn-primary btn-lg" onClick={onCommenceResuscitation}>
                {isTorReassessment ? 'Continue to termination review' : 'Commence resuscitation'}
              </button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => setPhase('list')}>
                Back to assessment
              </button>
            </div>
          )}

          {phase === 'list' && (
            <div className="actions">
              <button type="button" className="btn btn-primary btn-lg" onClick={onCommenceResuscitation}>
                {isTorReassessment
                  ? 'None apply — continue to termination review'
                  : 'No — commence resuscitation'}
              </button>
              {isTorReassessment && onCancel && (
                <button type="button" className="btn btn-secondary btn-lg" onClick={onCancel}>
                  Cancel — return to resuscitation
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

function getDirectVodLabels(
  selectedMainIds: Set<InitialAssessmentItemId>,
  selectedObviousIds: Set<ObviouslyDeceasedCriterionId>,
): string[] {
  const labels: string[] = []
  for (const id of selectedMainIds) {
    if (id === OBVIOUSLY_DECEASED_ID) continue
    const option = INITIAL_ASSESSMENT_OPTIONS.find((entry) => entry.id === id)
    if (option) labels.push(option.label)
  }
  for (const id of selectedObviousIds) {
    if (!isObviouslyDeceasedObservationCriterion(id)) {
      const criterion = OBVIOUSLY_DECEASED_CRITERIA.find((entry) => entry.id === id)
      if (criterion) labels.push(criterion.label)
    }
  }
  return labels
}

function getObservationLabels(selectedObviousIds: Set<ObviouslyDeceasedCriterionId>): string[] {
  return OBVIOUSLY_DECEASED_CRITERIA.filter(
    (criterion) =>
      selectedObviousIds.has(criterion.id) && isObviouslyDeceasedObservationCriterion(criterion.id),
  ).map((criterion) => criterion.label)
}

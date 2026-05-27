import {
  buildRxDrugLines,
  getAdrenalineNextDueLabel,
  getRxBoxVisualState,
  getRxDrugTotals,
} from '../drugs'
import type { RxDrugId } from '../drugs'
import { toDisplaySeconds } from '../timing'
import type { Rhythm } from '../types'

interface TimerRxSectionProps {
  initialRhythm: Rhythm
  hasNonShockableRhythm: boolean
  adrenalineDoseCount: number
  amiodaroneDoseCount: number
  shockCount: number
  elapsedSeconds: number
  nextAdrenalineAt: number | null
  onLogAdrenaline: () => void
  onLogAmiodarone: () => void
  formatRemaining: (actualSeconds: number) => string
}

export function TimerRxSection({
  initialRhythm,
  hasNonShockableRhythm,
  adrenalineDoseCount,
  amiodaroneDoseCount,
  shockCount,
  elapsedSeconds,
  nextAdrenalineAt,
  onLogAdrenaline,
  onLogAmiodarone,
  formatRemaining,
}: TimerRxSectionProps) {
  const lines = buildRxDrugLines({
    initialRhythm,
    hasNonShockableRhythm,
    adrenalineDoseCount,
    amiodaroneDoseCount,
    shockCount,
    elapsedSeconds,
    nextAdrenalineAt,
  })

  const visualState = getRxBoxVisualState(lines, toDisplaySeconds)
  const totals = getRxDrugTotals(initialRhythm, adrenalineDoseCount, amiodaroneDoseCount, shockCount)

  function handleLog(id: RxDrugId) {
    if (id === 'adrenaline') onLogAdrenaline()
    else onLogAmiodarone()
  }

  return (
    <div id="timer-rx" className={`timer-rx timer-rx-${visualState}`}>
      <div className="timer-rx-header">
        <div className="timer-rx-title">Rx</div>
        <div className="timer-rx-totals">
          {totals.map((total) => (
            <span key={total.drugName} className="timer-rx-drug-total">
              {total.drugName}: {total.count} administered
            </span>
          ))}
        </div>
      </div>
      <div className="timer-rx-drug-lines">
        {lines.map((line) => (
          <div key={line.id} className="timer-rx-row">
            {line.showCountdown ? (
              <>
                <span className="timer-rx-next-label">{getAdrenalineNextDueLabel()}</span>
                <span className="timer-rx-countdown">{formatRemaining(line.countdownRemaining)}</span>
              </>
            ) : (
              <>
                <span className="timer-rx-prompt">{line.prompt}</span>
                {line.showButton && (
                  <button
                    type="button"
                    className="btn btn-sm timer-rx-action-btn"
                    onClick={() => handleLog(line.id)}
                  >
                    {line.actionLabel}
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

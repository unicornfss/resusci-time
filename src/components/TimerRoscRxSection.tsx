import { getAtropineAdministeredTotal } from '../roscMonitoring'

interface TimerRoscRxSectionProps {
  atropineTotalMg: number
}

export function TimerRoscRxSection({ atropineTotalMg }: TimerRoscRxSectionProps) {
  return (
    <div id="timer-rosc-rx" className="timer-rx timer-rx-idle">
      <div className="timer-rx-header">
        <div className="timer-rx-title">Rx</div>
        <div className="timer-rx-totals">
          <span className="timer-rx-drug-total">{getAtropineAdministeredTotal(atropineTotalMg)}</span>
        </div>
      </div>
    </div>
  )
}

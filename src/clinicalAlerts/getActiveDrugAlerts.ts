import {
  ADRENALINE_ASAP_PROMPT,
  buildRxDrugLines,
  type BuildRxDrugLinesParams,
  type RxDrugLineView,
} from '../drugs'
import type { ClinicalAlertId } from './types'

export function drugLineMatchesClinicalAlert(line: RxDrugLineView, alertId: ClinicalAlertId): boolean {
  if (line.id === 'adrenaline') {
    switch (alertId) {
      case 'D-01':
        return line.showButton && line.prompt === ADRENALINE_ASAP_PROMPT
      case 'D-02':
        return line.isUpcomingWarning
      case 'D-03':
        return line.showButton && line.prompt !== ADRENALINE_ASAP_PROMPT
      case 'D-04':
        return line.showCountdown
      default:
        return false
    }
  }

  if (line.id === 'amiodarone') {
    switch (alertId) {
      case 'D-05':
        return line.isUpcomingWarning && !line.prompt.includes('150')
      case 'D-06':
        return line.showButton && line.prompt.includes('300')
      case 'D-07':
        return line.isUpcomingWarning && line.prompt.includes('150')
      case 'D-08':
        return line.showButton && line.prompt.includes('150')
      case 'D-09':
        return line.prompt.includes('all doses given')
      default:
        return false
    }
  }

  return false
}

export function getActiveDrugAlertIds(params: BuildRxDrugLinesParams): ClinicalAlertId[] {
  const ids: ClinicalAlertId[] = []

  for (const line of buildRxDrugLines(params)) {
    if (line.id === 'adrenaline') {
      if (line.showCountdown) {
        ids.push('D-04')
      } else if (line.showButton && line.prompt === ADRENALINE_ASAP_PROMPT) {
        ids.push('D-01')
      } else if (line.isUpcomingWarning) {
        ids.push('D-02')
      } else if (line.showButton) {
        ids.push('D-03')
      }
      continue
    }

    if (line.id === 'amiodarone') {
      if (line.prompt.includes('all doses given')) {
        ids.push('D-09')
      } else if (line.isUpcomingWarning && line.prompt.includes('150')) {
        ids.push('D-07')
      } else if (line.isUpcomingWarning) {
        ids.push('D-05')
      } else if (line.showButton && line.prompt.includes('150')) {
        ids.push('D-08')
      } else if (line.showButton) {
        ids.push('D-06')
      }
    }
  }

  return ids
}

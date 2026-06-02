import type { ProtocolStep } from '../types'
import type { ClinicalAlertId } from './types'

type ShockContext = 'initial' | 'check' | null
type TimerView = 'arrest' | 'rosc'

export interface ClinicalAlertContext {
  step: ProtocolStep
  timerView: TimerView
  shockFormContext: ShockContext
  showRhythmCheckAlert: boolean
  resuscitationOngoing: boolean
  showFortyFiveAlert: boolean
  fortyFiveAcknowledged: boolean
  showVectorChangeReminder: boolean
  showEarlyTransfer: boolean
  showCodeShock: boolean
  showProlongedVf: boolean
  showVascularAccessPanel: boolean
  showClinicalDiscussionTimer: boolean
  clinicalDiscussionOpen: boolean
  sbpReminderVisible: boolean
  sbpReminderExpanded: boolean
  pulseReminderVisible: boolean
  pulseReminderExpanded: boolean
  pulseShowAtropineMaxMessage: boolean
}

export function deriveActiveClinicalAlerts(context: ClinicalAlertContext): ClinicalAlertId[] {
  const alerts: ClinicalAlertId[] = []

  if (
    context.showRhythmCheckAlert &&
    context.resuscitationOngoing &&
    context.shockFormContext === 'check'
  ) {
    alerts.push('R-02')
  } else if (context.showRhythmCheckAlert && context.resuscitationOngoing) {
    alerts.push('R-01')
  }

  if (context.step === 'select-rhythm') {
    if (context.shockFormContext === 'initial') {
      alerts.push('I-02')
    } else {
      alerts.push('I-01')
    }
  }

  if (
    context.showFortyFiveAlert &&
    !context.fortyFiveAcknowledged &&
    context.timerView !== 'rosc'
  ) {
    alerts.push('C-01')
  }

  if (context.showVectorChangeReminder) {
    alerts.push('C-02')
  }

  if (context.showEarlyTransfer) {
    alerts.push('C-03')
  }

  if (context.showCodeShock) {
    alerts.push('C-04')
  }

  if (context.showProlongedVf) {
    alerts.push('C-05')
  }

  if (context.showVascularAccessPanel) {
    alerts.push('C-06')
  }

  if (context.showClinicalDiscussionTimer) {
    alerts.push(context.clinicalDiscussionOpen ? 'S-02' : 'S-01')
  }

  if (context.sbpReminderVisible) {
    alerts.push(context.sbpReminderExpanded ? 'P-02' : 'P-01')
  }

  if (context.pulseReminderVisible) {
    if (context.pulseShowAtropineMaxMessage) {
      alerts.push('P-05')
    } else if (context.pulseReminderExpanded) {
      alerts.push('P-04')
    } else {
      alerts.push('P-03')
    }
  }

  return alerts
}

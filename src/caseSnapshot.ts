import type { ReversibleCauseId } from './reversibleCauses'
import type { RoscTaskId, TimerView } from './roscTasks'
import type { ResuscitationQualityPromptId } from './protocol'
import type {
  ProtocolStep,
  Rhythm,
  RoscStatus,
} from './types'

export const CASE_SNAPSHOT_VERSION = 1 as const

export type SnapshotRhythmCheckEntry = {
  minute: number
  label: string
  rhythm: Rhythm
  shockJoules?: number
}

export interface CaseSnapshot {
  version: typeof CASE_SNAPSHOT_VERSION
  permanentLogId: string
  step: ProtocolStep
  initialRhythm: Rhythm | null
  currentRhythm: Rhythm | null
  rhythmChecks: SnapshotRhythmCheckEntry[]
  timerElapsedSeconds: number
  timerIsRunning: boolean
  timerNextCheckAt: number
  timerFortyFiveFired: boolean
  timerCheckDueFired: boolean
  timerView: TimerView
  roscElapsedSeconds: number
  adrenalineDoseCount: number
  amiodaroneDoseCount: number
  nextAdrenalineAt: number | null
  consecutiveShockCount: number
  fortyFiveAcknowledged: boolean
  earlyTransferAcknowledged: boolean
  codeShockAcknowledged: boolean
  prolongedVfAcknowledged: boolean
  prolongedVfLogged: boolean
  completedQualityPromptIds: ResuscitationQualityPromptId[]
  completedReversibleCauseIds: ReversibleCauseId[]
  completedRoscTaskIds: RoscTaskId[]
  atropineTotalMg: number
  hasSbpFluidLogged: boolean
  sustainedRoscEverAchieved: boolean
  sustainedRoscLogged: boolean
  /** Present from 1.2.x; inferred from log when restoring older snapshots. */
  roscEverAchieved?: boolean
  roscStatus: RoscStatus | null
  peaTorCriteriaMet: boolean | null
  torSpecialCircumstancesBelieved: boolean | null
  torEndedAtLabel: string | null
  vodAtLabel: string | null
  vodCountdownRemaining: number
  clinicalDiscussionPending: boolean
  clinicalDiscussionContinued: boolean
  metronomeEnabled: boolean
  showRhythmCheckAlert: boolean
  showFortyFiveAlert: boolean
}

export interface TimerRestoreState {
  elapsedSeconds: number
  isRunning: boolean
  nextCheckAt: number
  fortyFiveFired: boolean
  checkDueFired: boolean
}

export function timerRestoreFromSnapshot(snapshot: CaseSnapshot): TimerRestoreState {
  return {
    elapsedSeconds: snapshot.timerElapsedSeconds,
    isRunning: snapshot.timerIsRunning,
    nextCheckAt: snapshot.timerNextCheckAt,
    fortyFiveFired: snapshot.timerFortyFiveFired,
    checkDueFired: snapshot.timerCheckDueFired,
  }
}

export function isCaseSnapshot(value: unknown): value is CaseSnapshot {
  return (
    typeof value === 'object' &&
    value != null &&
    (value as CaseSnapshot).version === CASE_SNAPSHOT_VERSION &&
    typeof (value as CaseSnapshot).step === 'string'
  )
}

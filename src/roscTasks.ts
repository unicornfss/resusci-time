import { allReversibleCausesComplete, type ReversibleCauseId } from './reversibleCauses'
import { ROSC_SUSTAINED_THRESHOLD_DISPLAY_SECONDS, toDisplaySeconds } from './timing'

export type RoscTaskId =
  | 'abcde'
  | 'spo2-paco2'
  | '12-lead-ecg'
  | 'reversible-causes'
  | 'temperature-control'

export type RoscTaskAction = 'log' | 'reversible-causes'

export interface RoscTask {
  id: RoscTaskId
  label: string
  action: RoscTaskAction
}

export const ROSC_TASK_ITEMS: readonly RoscTask[] = [
  { id: 'abcde', label: 'ABCDE assessment', action: 'log' },
  { id: 'spo2-paco2', label: 'Aim for SpO2 94-98% and normal PaCO2', action: 'log' },
  { id: '12-lead-ecg', label: '12 lead ECG', action: 'log' },
  { id: 'reversible-causes', label: 'Identify and treat reversible causes', action: 'reversible-causes' },
  { id: 'temperature-control', label: 'Temperature control', action: 'log' },
]

export type TimerView = 'arrest' | 'rosc'

export function isSustainedRoscReached(actualSeconds: number, timeScale: number): boolean {
  return toDisplaySeconds(actualSeconds, timeScale) >= ROSC_SUSTAINED_THRESHOLD_DISPLAY_SECONDS
}

export function getRoscPhaseLabel(
  actualSeconds: number,
  timeScale: number,
): 'Transient ROSC' | 'Sustained ROSC' {
  return isSustainedRoscReached(actualSeconds, timeScale) ? 'Sustained ROSC' : 'Transient ROSC'
}

export function isRoscTaskComplete(
  id: RoscTaskId,
  completedTaskIds: ReadonlySet<RoscTaskId>,
  completedReversibleCauseIds: ReadonlySet<ReversibleCauseId>,
): boolean {
  if (id === 'reversible-causes') {
    return allReversibleCausesComplete(completedReversibleCauseIds)
  }
  return completedTaskIds.has(id)
}

export function getRoscTaskLogLabel(label: string): string {
  return `Post ROSC care: ${label}`
}

export function getRoscCommencedLogLabel(): string {
  return 'ROSC — post-arrest care commenced'
}

export function getCardiacArrestLogLabel(): string {
  return 'Cardiac arrest'
}

export function getRoscRhythmCheckLogLabel(): string {
  return 'ROSC'
}

export function getSustainedRoscAchievedLogLabel(): string {
  return 'Sustained ROSC achieved (more than 10 minutes with output)'
}

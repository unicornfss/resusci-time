import type { DisplayLogEntry, Rhythm, TerminationGuidance } from './types'

export const RHYTHM_VF_PVT = 'VF / pVT' as const

export const INITIAL_ASSESSMENT_OPTIONS = [
  { id: 'obviously-deceased', label: 'Obviously deceased' },
  { id: 'adrt-dnacpr', label: 'ADRT / DNACPR / ReSPECT (Resuscitation Decision)' },
  { id: 'lpa', label: 'Valid LPA (Lasting Power of Attorney) request' },
  { id: 'futility', label: 'Futility' },
  { id: 'end-of-life-care', label: 'End of Life Care' },
] as const

export type InitialAssessmentItemId = (typeof INITIAL_ASSESSMENT_OPTIONS)[number]['id']

/** @deprecated use INITIAL_ASSESSMENT_OPTIONS */
export const INITIAL_ASSESSMENT_ITEMS = INITIAL_ASSESSMENT_OPTIONS.map((option) => option.label)

export const OBVIOUSLY_DECEASED_IMMEDIATE_CRITERIA = [
  { id: 'decapitation', label: 'Decapitation' },
  { id: 'hemicorporectomy', label: 'Hemicorporectomy' },
  { id: 'massive-cranial-destruction', label: 'Massive cranial or cerebral destruction' },
  { id: 'decomposition-incineration', label: 'Decomposition or incineration' },
] as const

export const OBVIOUSLY_DECEASED_OBSERVATION_CRITERIA = [
  { id: 'hypostasis', label: 'Hypostasis' },
  { id: 'rigor-mortis', label: 'Rigor mortis' },
] as const

export const OBVIOUSLY_DECEASED_CRITERIA = [
  ...OBVIOUSLY_DECEASED_IMMEDIATE_CRITERIA,
  ...OBVIOUSLY_DECEASED_OBSERVATION_CRITERIA,
] as const

export type ObviouslyDeceasedCriterionId = (typeof OBVIOUSLY_DECEASED_CRITERIA)[number]['id']

export const VOD_OBSERVATION_CHECKLIST_HEADER =
  'Confirm 5 minutes of the following (continuous):'

export const VOD_OBSERVATION_CHECKLIST_ITEMS = [
  { id: 'apnoea', label: 'Apnoea' },
  { id: 'absent-central-pulse', label: 'Absent circulation at central pulse site' },
  { id: 'unresponsive-gcs3', label: 'Unresponsive (GCS 3/15)' },
  { id: 'asystole', label: 'Asystole' },
] as const

export type VodObservationChecklistId = (typeof VOD_OBSERVATION_CHECKLIST_ITEMS)[number]['id']

export function getVodCriteriaLogLabel(criteria: string): string {
  return `VOD: ${criteria}`
}

export const VOD_CRITERIA_LOG_PREFIX = 'VOD: '

export function isVodCriteriaLogEntry(text: string): boolean {
  return text.startsWith(VOD_CRITERIA_LOG_PREFIX)
}

export function getVodCriteriaDisplayName(text: string): string {
  return isVodCriteriaLogEntry(text) ? text.slice(VOD_CRITERIA_LOG_PREFIX.length) : text
}

export function filterVodCriteriaLogEntries(
  entries: readonly DisplayLogEntry[],
): DisplayLogEntry[] {
  return entries.filter((entry) => isVodCriteriaLogEntry(entry.text))
}

export function isObviouslyDeceasedObservationCriterion(
  id: ObviouslyDeceasedCriterionId,
): boolean {
  return id === 'hypostasis' || id === 'rigor-mortis'
}

export const RHYTHM_OPTIONS: Rhythm[] = [RHYTHM_VF_PVT, 'PEA', 'Asystole']

export const RESUSCITATION_QUALITY_HEADER =
  'High-quality chest compressions and ventilations, and:'

export type ResuscitationQualityPromptId =
  | 'additional-resources'
  | 'pad-placement'
  | 'oxygen'
  | 'continuous-compressions'
  | 'capnography'
  | 'minimise-interruptions'
  | 'vascular-access'
  | 'reversible-causes'

export type ResuscitationQualityPromptAction =
  | 'log'
  | 'vascular-access'
  | 'airway-interventions'
  | 'reversible-causes'

export interface ResuscitationQualityPrompt {
  id: ResuscitationQualityPromptId
  label: string
  action: ResuscitationQualityPromptAction
}

export const RESUSCITATION_QUALITY_ITEMS: readonly ResuscitationQualityPrompt[] = [
  { id: 'additional-resources', label: 'Request additional resources (if required)', action: 'log' },
  { id: 'minimise-interruptions', label: 'Minimise interruptions to chest compressions', action: 'log' },
  { id: 'pad-placement', label: 'Ensure optimal defibrillator pad placement', action: 'log' },
  { id: 'oxygen', label: 'Give oxygen', action: 'log' },
  { id: 'continuous-compressions', label: 'Continuous compressions if tracheal tube or SGA', action: 'airway-interventions' },
  { id: 'capnography', label: 'Use waveform capnography', action: 'log' },
  { id: 'vascular-access', label: 'Early IV access (IO if IV not possible)', action: 'vascular-access' },
  { id: 'reversible-causes', label: 'Address reversible causes', action: 'reversible-causes' },
]

/** @deprecated use RESUSCITATION_QUALITY_ITEMS */
export const RESUSCITATION_QUALITY_PROMPTS = RESUSCITATION_QUALITY_ITEMS.map((item) => item.label)

export function shouldShowEarlyTransferReminder(
  initialRhythm: Rhythm | null,
  rhythmChecksLogged: number,
  acknowledged: boolean,
  roscEverAchieved = false,
): boolean {
  if (acknowledged) return false
  if (roscEverAchieved) return false
  if (rhythmChecksLogged < 3) return false
  return initialRhythm === RHYTHM_VF_PVT || initialRhythm === 'PEA'
}

export function getEarlyTransferPrompt(): string {
  return 'Consider early transfer to hospital if indicated.'
}

export function getEarlyTransferLogLabel(): string {
  return 'Early transfer to hospital — considered'
}

import { serviceConfig } from './config'

export function shouldShowCodeShockReminder(
  initialRhythm: Rhythm | null,
  shockCount: number,
  acknowledged: boolean,
): boolean {
  const { codeShock } = serviceConfig.features
  if (!codeShock) return false
  if (acknowledged) return false
  if (initialRhythm !== RHYTHM_VF_PVT) return false
  return shockCount >= codeShock.minShocks
}

export function getCodeShockPrompt(): string {
  return serviceConfig.features.codeShock?.prompt ?? ''
}

export function getCodeShockLogLabel(): string {
  return serviceConfig.features.codeShock?.logLabel ?? ''
}

export const CONSECUTIVE_SHOCKS_FOR_VECTOR_REMINDER = 3

export function shouldShowVectorChangeReminder(consecutiveShockCount: number): boolean {
  return (
    consecutiveShockCount > 0 &&
    consecutiveShockCount % CONSECUTIVE_SHOCKS_FOR_VECTOR_REMINDER === 0
  )
}

export function getVectorChangePrompt(): string {
  return 'Consider vector change.'
}

export function getVectorChangeLogLabel(changed: boolean): string {
  return changed ? 'Vector change — changed' : 'Vector change — not changed'
}

export function shouldTriggerProlongedVf(consecutiveShockCount: number): boolean {
  return consecutiveShockCount >= CONSECUTIVE_SHOCKS_FOR_VECTOR_REMINDER
}

export const PROLONGED_VF_LOG_LABEL = 'Prolonged VF'

export function getProlongedVfPrompt(): string {
  return 'Prolonged VF — senior advice will be required before any termination of resuscitation.'
}

export const PROLONGED_VF_TOR_MESSAGE =
  'This patient has experienced at least one episode of prolonged VF (three consecutive shockable rhythms). Senior clinical discussion must take place before terminating resuscitation.'

export function isProlongedVfTorGateEnabled(): boolean {
  return serviceConfig.features.prolongedVfTorGate?.enabled === true
}

export function getProlongedVfTorMessage(): string {
  return PROLONGED_VF_TOR_MESSAGE
}

export function hasProlongedVfLogged(logTexts: readonly string[]): boolean {
  return logTexts.includes(PROLONGED_VF_LOG_LABEL)
}

export function nextConsecutiveShockCount(
  currentCount: number,
  rhythm: Rhythm,
  shockJoules?: number | null,
): number {
  if (rhythm === RHYTHM_VF_PVT && shockJoules != null) return currentCount + 1
  return 0
}

export function getPathSpecificActions(rhythm: Rhythm): string[] {
  switch (rhythm) {
    case RHYTHM_VF_PVT:
      return ['Follow any local pathway for refractory cardiac arrest.']
    case 'PEA':
      return ['Treat any reversible cause identified or strongly suspected.']
    case 'Asystole':
      return [
        'Gather information to decide if continuing treatment is in the patient\'s best interest.',
        'Discontinue at any point if continuing resuscitation is felt to be inappropriate.',
      ]
  }
}

export function getPathActions(rhythm: Rhythm): string[] {
  return [...RESUSCITATION_QUALITY_PROMPTS, ...getPathSpecificActions(rhythm)]
}

export function getQualityPromptLogLabel(label: string): string {
  return label
}

export const PEA_TOR_CRITERIA_QUESTION =
  'Is rate below 40 bpm and width of QRS complexes greater than 120 ms?'

export const TOR_SPECIAL_CIRCUMSTANCES_QUESTION =
  'Do you believe any of the following to be true?'

export const TOR_SPECIAL_CIRCUMSTANCES_ITEMS = [
  'The primary cause of cardiac arrest is hypothermia',
  'Suspected drug overdose or poisoning',
  'The patient is pregnant',
] as const

export const TOR_SPECIAL_CIRCUMSTANCES_ADVICE_MESSAGE =
  'Senior clinical advice must always be sought when any of these circumstances are believed to apply.'

export const TOR_SPECIAL_CIRCUMSTANCES_YES_LOG =
  'TOR — special circumstances believed (hypothermia, overdose/poisoning, or pregnancy) — senior clinical advice required'

export const TOR_SPECIAL_CIRCUMSTANCES_NO_LOG = 'TOR — no special circumstances believed'

export const TOR_REASSESSMENT_STARTED_LOG = 'TOR — initial assessment re-visited'

export const TOR_REASSESSMENT_CONTINUE_LOG =
  'TOR reassessment — none apply, continuing to termination review'

export const TOR_END_LABEL = 'Termination of resuscitation — resuscitation ended'

export const TOR_CONTINUE_LABEL = 'Termination of resuscitation — resuscitation continued'

export const TOR_SENIOR_ADVICE_LABEL =
  'Termination of resuscitation — senior clinical advice sought'

export const CLINICAL_DISCUSSION_CONTINUE_LABEL = 'Clinical discussion — continue resuscitation'

export const SUSTAINED_ROSC_REARREST_TOR_MESSAGE =
  'Prior sustained ROSC was achieved but the patient is now back in cardiac arrest — seek senior clinical advice.'

export const SUSTAINED_ROSC_ADVISORY_NOTICE =
  'Senior clinical discussion would be required should the patient return to cardiac arrest before any cessation of resuscitation.'

export const SUSTAINED_ROSC_TOR_MESSAGE =
  'This patient previously achieved sustained ROSC (more than 10 minutes with output). Senior clinical discussion must take place before terminating resuscitation.'

export function getSustainedRoscTorMessage(): string {
  return SUSTAINED_ROSC_TOR_MESSAGE
}

export function getSustainedRoscAdvisoryNotice(): string {
  return SUSTAINED_ROSC_ADVISORY_NOTICE
}

export const VOD_READY_MESSAGE =
  'Verification of death can now take place if the patient has been in continuous asystole for a period of at least 5 minutes'

export const VOD_RESUSCITATION_NOT_APPROPRIATE_MESSAGE = 'Resuscitation not appropriate'

export const VOD_LOG_LABEL = 'Verification of death'

export function getTorStampLabel(occurredAt: Date): string {
  return `TOR occurred at ${formatActualTime(occurredAt)}`
}

export function needsPeaTorCriteriaQuestion(
  initialRhythm: Rhythm,
  currentRhythm: Rhythm | null,
): boolean {
  return initialRhythm !== 'Asystole' && currentRhythm === 'PEA'
}

export function getTerminationGuidance(
  initialRhythm: Rhythm,
  currentRhythm: Rhythm,
  peaMeetsCessationCriteria: boolean | null,
  sustainedRoscEverAchieved = false,
): TerminationGuidance | null {
  if (sustainedRoscEverAchieved) {
    return {
      kind: 'seek-advice',
      message: SUSTAINED_ROSC_REARREST_TOR_MESSAGE,
    }
  }

  if (initialRhythm === 'Asystole') {
    return {
      kind: 'asystole-initial',
      message:
        'Termination of resuscitation should now be considered regardless of current rhythm unless there are compelling reasons to continue.',
    }
  }

  switch (currentRhythm) {
    case 'Asystole':
      return {
        kind: 'end-or-continue',
        message: 'Termination of resuscitation is appropriate.',
      }

    case 'PEA':
      if (peaMeetsCessationCriteria === null) return null
      if (peaMeetsCessationCriteria) {
        return {
          kind: 'end-or-continue',
          message:
            'PEA with rate below 40 bpm and QRS width greater than 120 ms — termination of resuscitation is appropriate.',
        }
      }
      return {
        kind: 'seek-advice',
        message: 'Seek senior advice.',
      }

    case RHYTHM_VF_PVT:
      if (initialRhythm === RHYTHM_VF_PVT) {
        return {
          kind: 'seek-advice',
          message: 'Seek senior advice.',
        }
      }
      return {
        kind: 'end-or-continue',
        message: 'Termination of resuscitation is appropriate.',
      }
  }
}

export function getRoscGuidance(status: 'sustained' | 'transient' | 'none'): string {
  switch (status) {
    case 'sustained':
      return 'Following ROSC the focus should be on stabilisation and transfer. Patients achieving sustained ROSC (more than 10 minutes) who re-arrest should be discussed with a senior clinician if they remain in cardiac arrest following 45 minutes of resuscitation.'
    case 'transient':
      return 'Transient ROSC is defined as a rhythm with output that lasted less than 10 minutes. Any transient ROSC occurring during a resuscitation attempt can be disregarded and termination of resuscitation considered based on the guidance above.'
    case 'none':
      return 'Resuscitation beyond 45 minutes is unlikely to be successful. Seek senior support if required or if there are compelling reasons to continue.'
  }
}

export function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatActualTime(date = new Date()): string {
  const h = date.getHours()
  const m = date.getMinutes()
  const s = date.getSeconds()
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function createDisplayLogEntry(text: string, at = new Date()): DisplayLogEntry {
  return {
    atEpochMs: at.getTime(),
    label: formatActualTime(at),
    text,
  }
}

export function sortDisplayLogEntries(entries: DisplayLogEntry[]): DisplayLogEntry[] {
  return [...entries].sort((a, b) => a.atEpochMs - b.atEpochMs)
}

export function rhythmCssClass(rhythm: Rhythm): string {
  if (rhythm === RHYTHM_VF_PVT) return 'rhythm-vfvt'
  if (rhythm === 'PEA') return 'rhythm-pea'
  return 'rhythm-asystole'
}

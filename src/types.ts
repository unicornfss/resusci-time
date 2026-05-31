export interface DisplayLogEntry {
  atEpochMs: number
  label: string
  text: string
}

export type Rhythm = 'VF / pVT' | 'PEA' | 'Asystole'

export type ProtocolStep =
  | 'start'
  | 'initial-assessment'
  | 'do-not-resuscitate'
  | 'commence-resuscitation'
  | 'select-rhythm'
  | 'active-resuscitation'
  | 'rhythm-check'
  | 'tor-reassessment'
  | 'forty-five-minute-check'
  | 'termination-guidance'
  | 'rosc-assessment'
  | 'post-tor'
  | 'complete'

export type RoscStatus = 'sustained' | 'transient' | 'none'

export type TerminationGuidanceKind = 'end-or-continue' | 'seek-advice' | 'asystole-initial'

export interface TerminationGuidance {
  kind: TerminationGuidanceKind
  message: string
}

/** @deprecated Use TerminationGuidance */
export interface TerminationResult {
  action: 'cease' | 'seek-advice' | 'continue-unless-reason'
  message: string
}

export interface ProtocolState {
  step: ProtocolStep
  initialRhythm: Rhythm | null
  currentRhythm: Rhythm | null
  heartRate: number | null
  qrsWidthMs: number | null
  roscStatus: RoscStatus | null
  fortyFiveMinuteAcknowledged: boolean
}

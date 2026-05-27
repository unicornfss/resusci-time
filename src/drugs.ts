import type { Rhythm } from './types'

export const ADRENALINE_STRENGTH = '1:10,000'
export const ADRENALINE_DRUG_NAME = 'Adrenaline'
export const ADRENALINE_ASAP_PROMPT = `Adrenaline ${ADRENALINE_STRENGTH} — administer ASAP`
export const ADRENALINE_REPEAT_PROMPT = `Adrenaline ${ADRENALINE_STRENGTH}`

export const AMIODARONE_DRUG_NAME = 'Amiodarone'
export const AMIODARONE_MAX_DOSES = 2
export const VFVT_ADRENALINE_FIRST_DOSE_MIN_SHOCKS = 3

/** Protocol seconds — last minute before next dose triggers warning styling. */
export const RX_WARNING_THRESHOLD_DISPLAY_SECONDS = 60

export type RxVisualState = 'idle' | 'warning' | 'due'
export type RxDrugId = 'adrenaline' | 'amiodarone'

export interface AmiodaroneDoseSpec {
  mg: number
  minShocks: number
}

export const AMIODARONE_DOSES: readonly AmiodaroneDoseSpec[] = [
  { mg: 300, minShocks: 3 },
  { mg: 150, minShocks: 5 },
]

export interface RxDrugLineView {
  id: RxDrugId
  prompt: string
  showCountdown: boolean
  countdownRemaining: number
  showButton: boolean
  isUpcomingWarning: boolean
  actionLabel: string
}

export interface RxDrugTotalView {
  drugName: string
  count: number
}

export interface BuildRxDrugLinesParams {
  initialRhythm: Rhythm
  hasNonShockableRhythm: boolean
  adrenalineDoseCount: number
  amiodaroneDoseCount: number
  shockCount: number
  elapsedSeconds: number
  nextAdrenalineAt: number | null
}

function ordinalShock(n: number): string {
  const mod100 = n % 100
  const suffix =
    mod100 >= 11 && mod100 <= 13
      ? 'th'
      : n % 10 === 1
        ? 'st'
        : n % 10 === 2
          ? 'nd'
          : n % 10 === 3
            ? 'rd'
            : 'th'
  return `${n}${suffix} shock`
}

export function shouldShowRxSection(initialRhythm: Rhythm | null): boolean {
  return initialRhythm != null
}

export function hasNonShockableRhythmLogged(rhythms: readonly Rhythm[]): boolean {
  return rhythms.some((r) => r === 'PEA' || r === 'Asystole')
}

/** First adrenaline dose is ASAP — non-shockable initial rhythm or any PEA/Asystole logged. */
export function requiresAdrenalineAsapForFirstDose(
  initialRhythm: Rhythm,
  hasNonShockableRhythm: boolean,
  adrenalineDoseCount: number,
): boolean {
  if (adrenalineDoseCount > 0) return false
  if (initialRhythm === 'PEA' || initialRhythm === 'Asystole') return true
  if (hasNonShockableRhythm) return true
  return false
}

/** First adrenaline dose waits for 3rd shock — VF/pVT initial with no non-shockable rhythm yet. */
export function requiresAdrenalineAfterThirdShock(
  initialRhythm: Rhythm,
  hasNonShockableRhythm: boolean,
  adrenalineDoseCount: number,
): boolean {
  if (adrenalineDoseCount > 0) return false
  if (requiresAdrenalineAsapForFirstDose(initialRhythm, hasNonShockableRhythm, adrenalineDoseCount)) {
    return false
  }
  return initialRhythm === 'VF / pVT'
}

export function shouldShowAmiodarone(initialRhythm: Rhythm, shockCount: number): boolean {
  return initialRhythm === 'VF / pVT' || shockCount > 0
}

export function getNextAmiodaroneDose(doseCount: number): AmiodaroneDoseSpec | null {
  if (doseCount >= AMIODARONE_MAX_DOSES) return null
  return AMIODARONE_DOSES[doseCount]
}

export function canLogAdrenaline(
  initialRhythm: Rhythm,
  doseCount: number,
  shockCount: number,
  hasNonShockableRhythm: boolean,
): boolean {
  if (doseCount > 0) return true
  if (requiresAdrenalineAsapForFirstDose(initialRhythm, hasNonShockableRhythm, doseCount)) {
    return true
  }
  if (requiresAdrenalineAfterThirdShock(initialRhythm, hasNonShockableRhythm, doseCount)) {
    return shockCount >= VFVT_ADRENALINE_FIRST_DOSE_MIN_SHOCKS
  }
  return true
}

export function canLogAmiodarone(doseCount: number, shockCount: number): boolean {
  const next = getNextAmiodaroneDose(doseCount)
  if (!next) return false
  return shockCount >= next.minShocks
}

export function isVfvtPreShockDrugWarning(
  shockCount: number,
  minShocks: number,
  pendingDose: boolean,
): boolean {
  return pendingDose && shockCount >= minShocks - 1 && shockCount < minShocks
}

function buildAdrenalineLine(params: BuildRxDrugLinesParams): RxDrugLineView {
  const {
    initialRhythm,
    hasNonShockableRhythm,
    adrenalineDoseCount,
    shockCount,
    elapsedSeconds,
    nextAdrenalineAt,
  } = params
  const hasDoses = adrenalineDoseCount > 0
  const asapFirst = requiresAdrenalineAsapForFirstDose(
    initialRhythm,
    hasNonShockableRhythm,
    adrenalineDoseCount,
  )
  const shockGatedFirst = requiresAdrenalineAfterThirdShock(
    initialRhythm,
    hasNonShockableRhythm,
    adrenalineDoseCount,
  )
  const logEnabled = canLogAdrenaline(
    initialRhythm,
    adrenalineDoseCount,
    shockCount,
    hasNonShockableRhythm,
  )
  const showInterval = hasDoses && nextAdrenalineAt != null
  const remaining = showInterval ? Math.max(0, nextAdrenalineAt - elapsedSeconds) : 0
  const showCountdown = showInterval && remaining > 0
  const showButton = logEnabled && !showCountdown

  let prompt = ADRENALINE_REPEAT_PROMPT
  let isUpcomingWarning = false

  if (!hasDoses) {
    if (asapFirst) {
      prompt = ADRENALINE_ASAP_PROMPT
    } else if (shockGatedFirst) {
      prompt =
        shockCount >= VFVT_ADRENALINE_FIRST_DOSE_MIN_SHOCKS
          ? ADRENALINE_REPEAT_PROMPT
          : `${ADRENALINE_DRUG_NAME} ${ADRENALINE_STRENGTH} — after ${ordinalShock(VFVT_ADRENALINE_FIRST_DOSE_MIN_SHOCKS)}`
      isUpcomingWarning = isVfvtPreShockDrugWarning(
        shockCount,
        VFVT_ADRENALINE_FIRST_DOSE_MIN_SHOCKS,
        true,
      )
    } else {
      prompt = ADRENALINE_ASAP_PROMPT
    }
  }

  return {
    id: 'adrenaline',
    prompt,
    showCountdown,
    countdownRemaining: remaining,
    showButton,
    isUpcomingWarning,
    actionLabel: 'ADX administered',
  }
}

function buildAmiodaroneLine(params: BuildRxDrugLinesParams): RxDrugLineView | null {
  const { amiodaroneDoseCount, shockCount } = params
  const next = getNextAmiodaroneDose(amiodaroneDoseCount)

  if (!next) {
    return {
      id: 'amiodarone',
      prompt: `${AMIODARONE_DRUG_NAME} — all doses given`,
      showCountdown: false,
      countdownRemaining: 0,
      showButton: false,
      isUpcomingWarning: false,
      actionLabel: 'Amiodarone administered',
    }
  }

  const logEnabled = canLogAmiodarone(amiodaroneDoseCount, shockCount)
  const isUpcomingWarning = isVfvtPreShockDrugWarning(shockCount, next.minShocks, true)
  const prompt =
    shockCount >= next.minShocks
      ? `${AMIODARONE_DRUG_NAME} ${next.mg}mg`
      : `${AMIODARONE_DRUG_NAME} ${next.mg}mg — after ${ordinalShock(next.minShocks)}`

  return {
    id: 'amiodarone',
    prompt,
    showCountdown: false,
    countdownRemaining: 0,
    showButton: logEnabled,
    isUpcomingWarning,
    actionLabel: 'Amiodarone administered',
  }
}

export function buildRxDrugLines(params: BuildRxDrugLinesParams): RxDrugLineView[] {
  const lines = [buildAdrenalineLine(params)]
  if (shouldShowAmiodarone(params.initialRhythm, params.shockCount)) {
    const amioLine = buildAmiodaroneLine(params)
    if (amioLine) lines.push(amioLine)
  }
  return lines
}

export function getDueRxDrugLines(params: BuildRxDrugLinesParams): RxDrugLineView[] {
  return buildRxDrugLines(params).filter((line) => line.showButton)
}

export function getRxDrugTotals(
  initialRhythm: Rhythm,
  adrenalineDoseCount: number,
  amiodaroneDoseCount: number,
  shockCount: number,
): RxDrugTotalView[] {
  const totals: RxDrugTotalView[] = [
    { drugName: ADRENALINE_DRUG_NAME, count: adrenalineDoseCount },
  ]
  if (shouldShowAmiodarone(initialRhythm, shockCount)) {
    totals.push({ drugName: AMIODARONE_DRUG_NAME, count: amiodaroneDoseCount })
  }
  return totals
}

export function getAdrenalineLogLabel(doseNumber: number): string {
  return `Adrenaline ${ADRENALINE_STRENGTH} — dose ${doseNumber}`
}

export function getAmiodaroneLogLabel(doseNumber: number): string {
  const spec = AMIODARONE_DOSES[doseNumber - 1]
  return `Amiodarone ${spec.mg}mg — dose ${doseNumber}`
}

export function getAdrenalineNextDueLabel(): string {
  return `${ADRENALINE_DRUG_NAME} next due in:`
}

export function formatDrugAdministeredTotal(drugName: string, count: number): string {
  return `${drugName}: ${count} administered`
}

export function getAdrenalineAdministeredTotal(count: number): string {
  return formatDrugAdministeredTotal(ADRENALINE_DRUG_NAME, count)
}

export function getAmiodaroneAdministeredTotal(count: number): string {
  return formatDrugAdministeredTotal(AMIODARONE_DRUG_NAME, count)
}

export function getRxBoxVisualState(
  lines: RxDrugLineView[],
  toDisplaySeconds: (actualSeconds: number) => number,
): RxVisualState {
  if (lines.some((line) => line.showButton)) return 'due'
  if (lines.some((line) => line.isUpcomingWarning)) return 'warning'
  if (
    lines.some(
      (line) =>
        line.showCountdown &&
        line.countdownRemaining > 0 &&
        toDisplaySeconds(line.countdownRemaining) <= RX_WARNING_THRESHOLD_DISPLAY_SECONDS,
    )
  ) {
    return 'warning'
  }
  return 'idle'
}

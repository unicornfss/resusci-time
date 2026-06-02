import {
  ADRENALINE_DRUG_NAME,
  RX_WARNING_THRESHOLD_DISPLAY_SECONDS,
  type BuildRxDrugLinesParams,
} from './drugs'
import { toDisplaySeconds } from './timing'

export interface CaseTransferImminentContext {
  /** Same conditions as the “Next rhythm check” timer bar. */
  rhythmCheckApplies: boolean
  secondsToNextRhythmCheck: number
  rxParams: BuildRxDrugLinesParams | null
  timeScale: number
}

export function getCaseTransferImminentWarnings(
  context: CaseTransferImminentContext,
  formatRemaining: (actualSeconds: number) => string,
): string[] {
  const warnings: string[] = []
  const threshold = RX_WARNING_THRESHOLD_DISPLAY_SECONDS

  if (context.rhythmCheckApplies) {
    const displayRemaining = toDisplaySeconds(context.secondsToNextRhythmCheck, context.timeScale)
    if (displayRemaining < threshold) {
      warnings.push(
        displayRemaining <= 0
          ? 'Rhythm check is due now'
          : `Rhythm check in less than a minute (${formatRemaining(context.secondsToNextRhythmCheck)} remaining)`,
      )
    }
  }

  const rx = context.rxParams
  if (rx && rx.adrenalineDoseCount > 0 && rx.nextAdrenalineAt != null) {
    const actualRemaining = rx.nextAdrenalineAt - rx.elapsedSeconds
    const displayRemaining = toDisplaySeconds(Math.max(0, actualRemaining), context.timeScale)
    if (displayRemaining < threshold) {
      warnings.push(
        displayRemaining <= 0
          ? `${ADRENALINE_DRUG_NAME} is due now`
          : `${ADRENALINE_DRUG_NAME} in less than a minute (${formatRemaining(Math.max(0, actualRemaining))} remaining)`,
      )
    }
  }

  return warnings
}

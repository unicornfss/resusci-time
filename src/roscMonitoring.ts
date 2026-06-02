export {
  SBP_ADEQUATE_LABEL,
  SBP_ADRENALINE_50_LABEL,
  SBP_ADRENALINE_100_LABEL,
  SBP_FLUID_250_LABEL,
  SBP_FLUID_500_LABEL,
  SBP_INADEQUATE_LABEL,
  SBP_NOTHING_ADMINISTERED_LABEL,
  SBP_REMINDER_PROMPT,
  getRoscSbpAdrenaline50LogLabel,
  getRoscSbpAdrenaline100LogLabel,
  getRoscSbpFluidLogLabel,
} from './sbpReminder'

export const PULSE_RATE_PROMPT = 'Pulse rate 60 bpm and above?'

export const PULSE_RATE_INADEQUATE_LABEL = 'Pulse below 60 bpm'

export const PULSE_RATE_ADEQUATE_LABEL = 'Pulse 60 bpm and above'

export const ATROPINE_CONSIDER_PROMPT = 'Consider atropine 600mcg'

export const ATROPINE_MAX_DOSE_MESSAGE = 'Maximum atropine dose (3mg) given'

export const ATROPINE_DOSE_MG = 0.6

export const ATROPINE_MAX_MG = 3

export const ATROPINE_DRUG_NAME = 'Atropine'

export function getAtropineAdministeredTotal(totalMg: number): string {
  return `${ATROPINE_DRUG_NAME}: ${formatAtropineMg(totalMg)} mg administered`
}

export function formatAtropineMg(totalMg: number): string {
  return totalMg.toFixed(1)
}

export function isAtropineMaxReached(totalMg: number): boolean {
  return totalMg >= ATROPINE_MAX_MG
}

export function getPulseRateAbove60LogLabel(): string {
  return 'Post ROSC care: Pulse rate 60 bpm and above'
}

export function getAtropineAdministeredLogLabel(): string {
  return 'Post ROSC care: Atropine 600mcg administered'
}

export function getAtropineNotAdministeredLogLabel(): string {
  return 'Post ROSC care: Atropine 600mcg not administered'
}

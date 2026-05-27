export const SBP_REMINDER_PROMPT = 'Maintain SBP < 100 mmHg (< 80 mmHg in trauma)'

export const SBP_ADEQUATE_LABEL = 'SBP < 100 mmHg (< 80 mmHg in trauma)'

export const SBP_LOW_LABEL = 'SBP > 100 mmHg (> 80 mmHg in trauma)'

export const SBP_FLUID_250_LABEL = '250ml sodium chloride'

export const SBP_FLUID_500_LABEL = '500ml sodium chloride'

export const SBP_NOTHING_ADMINISTERED_LABEL = 'Nothing administered at this time'

export const SBP_ADRENALINE_50_LABEL = '50mcg Adrenaline (0.5ml 1:10,000)'

export const SBP_ADRENALINE_100_LABEL = '100mcg Adrenaline (1.0ml 1:10,000)'

export function getRoscSbpFluidLogLabel(ml: '250ml' | '500ml'): string {
  return `Post ROSC care: ${ml} sodium chloride`
}

export function getRoscSbpAdrenaline50LogLabel(): string {
  return `Post ROSC care: ${SBP_ADRENALINE_50_LABEL}`
}

export function getRoscSbpAdrenaline100LogLabel(): string {
  return `Post ROSC care: ${SBP_ADRENALINE_100_LABEL}`
}

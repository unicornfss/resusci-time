export const INTERVENTION_OPTIONS = [
  { id: 'vascular-access', label: 'Vascular access' },
  { id: 'airway', label: 'Airway' },
  { id: 'breathing', label: 'Breathing' },
  { id: 'medications', label: 'Medications' },
] as const

export type InterventionId = (typeof INTERVENTION_OPTIONS)[number]['id']

export type OtherInterventionCategory = 'airway' | 'breathing' | 'medications'

export interface SavedOtherIntervention {
  category: OtherInterventionCategory
  label: string
}

export type InterventionSubStep = 'options' | 'sodium-chloride' | 'other'

export const AIRWAY_OPTIONS = [
  'Head tilt / jaw thrust',
  'OPA',
  'NPA',
  'SGA (i-gel)',
  'ET',
  'Needle cric.',
  'Tracheostomy',
] as const

export const BREATHING_OPTIONS = ['BVM', 'Mechanical vent.'] as const

export const SODIUM_CHLORIDE_OPTIONS = ['flush', '250ml', '500ml'] as const

export const MEDICATION_SIMPLE_OPTIONS = [
  { id: 'glucose-10', label: '10% glucose' },
  { id: 'naloxone', label: 'Naloxone' },
] as const

export const IV_CANNULA_GAUGES = [
  { gauge: '22g', colorClass: 'cannula-blue' },
  { gauge: '20g', colorClass: 'cannula-pink' },
  { gauge: '18g', colorClass: 'cannula-green' },
  { gauge: '16g', colorClass: 'cannula-grey' },
  { gauge: '14g', colorClass: 'cannula-orange' },
] as const

export type VascularAccessStep = 'prompt' | 'route' | 'iv-gauge'

export const CONTINUOUS_COMPRESSIONS_AIRWAY_OPTIONS = ['SGA (i-gel)', 'ET', 'Tracheostomy'] as const

export function isContinuousCompressionsAirwayOption(option: string): boolean {
  return (CONTINUOUS_COMPRESSIONS_AIRWAY_OPTIONS as readonly string[]).includes(option)
}

export function getInterventionCategoryLabel(id: InterventionId): string {
  return INTERVENTION_OPTIONS.find((o) => o.id === id)?.label ?? id
}

export function getVascularAccessPrompt(): string {
  return 'Establish vascular access.'
}

export function getVascularAccessLogLabel(access: { type: 'IO' } | { type: 'IV'; gauge: string }): string {
  if (access.type === 'IO') return 'Vascular access — IO'
  return `Vascular access — IV ${access.gauge}`
}

export function isVascularAccessLogEntry(text: string): boolean {
  return text.startsWith('Vascular access — ')
}

export function hasVascularAccessLogged(entries: readonly { text: string }[]): boolean {
  return entries.some((entry) => isVascularAccessLogEntry(entry.text))
}

export function getAirwayLogLabel(option: string): string {
  return `Airway — ${option}`
}

export function getBreathingLogEntries(option: (typeof BREATHING_OPTIONS)[number]): string[] {
  return [`Breathing — ${option}`, 'Oxygen']
}

export function getSodiumChlorideLogLabel(variant: (typeof SODIUM_CHLORIDE_OPTIONS)[number]): string {
  return `Medication — Sodium chloride (${variant})`
}

export function getMedicationLogLabel(label: string): string {
  return `Medication — ${label}`
}

export function getOtherInterventionLogLabel(category: OtherInterventionCategory, label: string): string {
  const prefix =
    category === 'airway' ? 'Airway' : category === 'breathing' ? 'Breathing' : 'Medication'
  return `${prefix} — ${label}`
}

export function getSavedOthersForCategory(
  saved: readonly SavedOtherIntervention[],
  category: OtherInterventionCategory,
): string[] {
  return saved.filter((e) => e.category === category).map((e) => e.label)
}

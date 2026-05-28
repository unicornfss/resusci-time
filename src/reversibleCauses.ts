export type ReversibleCauseId =
  | 'hypoxia'
  | 'hypovolaemia'
  | 'hypo-hyper-metabolic'
  | 'hypo-hyper-thermia'
  | 'thrombosis'
  | 'tension-pneumothorax'
  | 'toxins'
  | 'tamponade'

export interface ReversibleCause {
  id: ReversibleCauseId
  label: string
  letter: 'H' | 'T'
}

export const REVERSIBLE_CAUSES: readonly ReversibleCause[] = [
  { id: 'hypoxia', label: 'Hypoxia', letter: 'H' },
  { id: 'hypovolaemia', label: 'Hypovolaemia', letter: 'H' },
  { id: 'hypo-hyper-metabolic', label: 'Hypo / hyper metabolic', letter: 'H' },
  { id: 'hypo-hyper-thermia', label: 'Hypo hyper thermia', letter: 'H' },
  { id: 'thrombosis', label: 'Thrombosis', letter: 'T' },
  { id: 'tension-pneumothorax', label: 'Tension pneumothorax', letter: 'T' },
  { id: 'toxins', label: 'Toxins', letter: 'T' },
  { id: 'tamponade', label: 'Tamponade', letter: 'T' },
]

export const REVERSIBLE_CAUSE_H_ITEMS = REVERSIBLE_CAUSES.filter((item) => item.letter === 'H')
export const REVERSIBLE_CAUSE_T_ITEMS = REVERSIBLE_CAUSES.filter((item) => item.letter === 'T')

export function getReversibleCauseLogLabel(label: string): string {
  return `Reversible cause considered: ${label}`
}

export function getReversibleCauseUncheckedLogLabel(label: string): string {
  return `Reversible cause unchecked: ${label}`
}

export function allReversibleCausesComplete(completedIds: ReadonlySet<ReversibleCauseId>): boolean {
  return REVERSIBLE_CAUSES.every((item) => completedIds.has(item.id))
}

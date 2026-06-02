import type { ClinicalAlertId } from './types'

/** 0 = highest priority. Only listed alerts participate in the clinical queue. */
export const CLINICAL_ALERT_PRIORITIES: Record<ClinicalAlertId, number> = {
  'R-01': 0,
  'R-02': 0,

  'D-01': 1,
  'D-02': 1,
  'D-03': 1,
  'D-04': 1,
  'D-05': 1,
  'D-06': 1,
  'D-07': 1,
  'D-08': 1,
  'D-09': 1,

  'C-01': 1,
  'C-02': 2,
  'C-03': 3,
  'C-04': 1,
  'C-05': 3,
  'C-06': 1,

  'S-01': 1,
  'S-02': 1,

  'P-01': 1,
  'P-02': 1,
  'P-03': 1,
  'P-04': 1,
  'P-05': 1,

  'I-01': 1,
  'I-02': 1,
}

export function compareClinicalAlertPriority(a: ClinicalAlertId, b: ClinicalAlertId): number {
  const priorityDiff = CLINICAL_ALERT_PRIORITIES[a] - CLINICAL_ALERT_PRIORITIES[b]
  if (priorityDiff !== 0) return priorityDiff
  return 0
}

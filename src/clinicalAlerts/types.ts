export type ClinicalAlertId =
  | 'R-01'
  | 'R-02'
  | 'D-01'
  | 'D-02'
  | 'D-03'
  | 'D-04'
  | 'D-05'
  | 'D-06'
  | 'D-07'
  | 'D-08'
  | 'D-09'
  | 'C-01'
  | 'C-02'
  | 'C-03'
  | 'C-04'
  | 'C-05'
  | 'C-06'
  | 'S-01'
  | 'S-02'
  | 'P-01'
  | 'P-02'
  | 'P-03'
  | 'P-04'
  | 'P-05'
  | 'P-06'
  | 'I-01'
  | 'I-02'

export const DRUG_CLINICAL_ALERT_IDS = [
  'D-01',
  'D-02',
  'D-03',
  'D-04',
  'D-05',
  'D-06',
  'D-07',
  'D-08',
  'D-09',
] as const satisfies readonly ClinicalAlertId[]

export function isDrugClinicalAlert(id: ClinicalAlertId | null): id is (typeof DRUG_CLINICAL_ALERT_IDS)[number] {
  return id != null && (DRUG_CLINICAL_ALERT_IDS as readonly string[]).includes(id)
}

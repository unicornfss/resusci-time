import { useEffect, useMemo, useRef } from 'react'
import { CLINICAL_ALERT_PRIORITIES, compareClinicalAlertPriority } from './priorities'
import type { ClinicalAlertId } from './types'

export function pickCurrentClinicalAlert(
  activeAlerts: readonly ClinicalAlertId[],
  activationOrder: ReadonlyMap<ClinicalAlertId, number>,
  bumpToFront: ClinicalAlertId | null = null,
): ClinicalAlertId | null {
  if (activeAlerts.length === 0) return null

  if (bumpToFront && activeAlerts.includes(bumpToFront)) {
    const rhythmCheckActive = activeAlerts.some((id) => CLINICAL_ALERT_PRIORITIES[id] === 0)
    if (!rhythmCheckActive) {
      return bumpToFront
    }
  }

  return [...activeAlerts].sort((a, b) => {
    const priorityDiff = compareClinicalAlertPriority(a, b)
    if (priorityDiff !== 0) return priorityDiff
    return (activationOrder.get(a) ?? 0) - (activationOrder.get(b) ?? 0)
  })[0]
}

export function useClinicalAlertQueue(
  activeAlerts: ClinicalAlertId[],
  bumpToFront: ClinicalAlertId | null = null,
): ClinicalAlertId | null {
  const activationOrderRef = useRef<Map<ClinicalAlertId, number>>(new Map())
  const sequenceRef = useRef(0)

  useEffect(() => {
    const order = activationOrderRef.current
    for (const id of activeAlerts) {
      if (!order.has(id)) {
        order.set(id, sequenceRef.current++)
      }
    }
    for (const id of [...order.keys()]) {
      if (!activeAlerts.includes(id)) {
        order.delete(id)
      }
    }
  }, [activeAlerts])

  return useMemo(
    () => pickCurrentClinicalAlert(activeAlerts, activationOrderRef.current, bumpToFront),
    [activeAlerts, bumpToFront],
  )
}

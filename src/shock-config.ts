/**
 * Default defibrillation energies (Joules) by shock number.
 * Index 0 = 1st shock, index 1 = 2nd shock, index 2+ = all subsequent shocks.
 */
export const SHOCK_DEFAULT_ENERGIES_JOULES = [120, 150, 200] as const

export function getDefaultShockJoules(vfvtShockCount: number): number {
  const idx = Math.min(vfvtShockCount, SHOCK_DEFAULT_ENERGIES_JOULES.length - 1)
  return SHOCK_DEFAULT_ENERGIES_JOULES[idx]
}

export function formatRhythmLogLabel(rhythm: string, shockJoules?: number | null): string {
  if (rhythm === 'VF / pVT' && shockJoules != null) return `${rhythm} — ${shockJoules}J`
  return rhythm
}

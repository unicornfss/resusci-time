export const PREVIEW_SPEED_OPTIONS = [1, 2, 4, 5, 10] as const

export type PreviewSpeedMultiplier = (typeof PREVIEW_SPEED_OPTIONS)[number]

const STORAGE_KEY = 'resusci-time-preview-speed'

export function isPreviewSpeedMultiplier(value: number): value is PreviewSpeedMultiplier {
  return (PREVIEW_SPEED_OPTIONS as readonly number[]).includes(value)
}

export function defaultPreviewSpeedMultiplier(buildTimeScale: number): PreviewSpeedMultiplier {
  if (buildTimeScale >= 1) return 1
  const derived = Math.round(1 / buildTimeScale)
  return isPreviewSpeedMultiplier(derived) ? derived : 4
}

export function readStoredPreviewSpeed(buildTimeScale: number): PreviewSpeedMultiplier {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPreviewSpeedMultiplier(buildTimeScale)
    const parsed = Number(raw)
    return isPreviewSpeedMultiplier(parsed) ? parsed : defaultPreviewSpeedMultiplier(buildTimeScale)
  } catch {
    return defaultPreviewSpeedMultiplier(buildTimeScale)
  }
}

export function writeStoredPreviewSpeed(speed: PreviewSpeedMultiplier): void {
  localStorage.setItem(STORAGE_KEY, String(speed))
}

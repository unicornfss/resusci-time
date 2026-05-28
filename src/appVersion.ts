export const APP_VERSION = __APP_VERSION__

export const APP_BUILD_ISO = __APP_BUILD_ISO__

export function formatAppBuildDate(iso = APP_BUILD_ISO): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function getAppVersionSummary(): string {
  return `Version ${APP_VERSION} · Last updated ${formatAppBuildDate()}`
}

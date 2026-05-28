/** Shared trust path helpers for Node build scripts (keep in sync with src/config/trustIds.ts). */

export function previewOutputFolder(trustId) {
  return `${trustId}-preview`
}

import trustManifest from '../src/config/trust-manifest.json' with { type: 'json' }
import { liveOutputFolder, previewOutputFolder } from './trustPaths.mjs'

export const PRODUCTION_SITE_BASE = 'https://resusci-time.adminforge.co.uk'

export function formatTrustUrl(baseUrl, folder) {
  const root = baseUrl.replace(/\/$/, '')
  if (!folder) return `${root}/`
  return `${root}/${folder}/`
}

export function printTrustUrls({ baseUrl, heading, includeHome = true, includeBlog = false }) {
  if (heading) {
    console.log(heading)
  }

  if (includeHome) {
    console.log(`  Home:    ${formatTrustUrl(baseUrl, '')}`)
  }

  for (const { id, label } of trustManifest) {
    const liveUrl = formatTrustUrl(baseUrl, liveOutputFolder(id))
    const previewUrl = formatTrustUrl(baseUrl, previewOutputFolder(id))
    const tag = id === 'standard' ? 'public' : 'unlisted'

    console.log(`  ${label} live (${tag}):    ${liveUrl}`)
    console.log(`  ${label} preview:          ${previewUrl}`)
  }

  if (includeBlog) {
    console.log(`  Blog:    ${formatTrustUrl(baseUrl, 'blog')}`)
  }

  console.log('')
}

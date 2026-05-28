import { printTrustUrls, PRODUCTION_SITE_BASE } from './trust-path-urls.mjs'

console.log('Resusci-Time deploy URLs (custom trusts are unlisted — do not publish on the home page or blog)\n')

printTrustUrls({
  baseUrl: PRODUCTION_SITE_BASE,
  heading: `Production (${PRODUCTION_SITE_BASE}):`,
})

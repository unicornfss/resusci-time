import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { printTrustUrls } from './trust-path-urls.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distPages = join(root, 'dist-pages')
const port = process.env.PREVIEW_PORT ?? '4173'

function localLanHost() {
  const candidates = []
  for (const interfaces of Object.values(networkInterfaces())) {
    if (!interfaces) continue
    for (const iface of interfaces) {
      if (iface.family !== 'IPv4' || iface.internal) continue
      if (iface.address.startsWith('169.254.')) continue
      candidates.push(iface.address)
    }
  }
  return candidates[0] ?? null
}

if (!existsSync(distPages)) {
  console.error('\ndist-pages/ not found. Run npm run build:all first.\n')
  process.exit(1)
}

console.log('\nResusci-Time local preview\n')

printTrustUrls({
  baseUrl: `http://localhost:${port}`,
  heading: 'On this PC (localhost):',
})

const lanHost = localLanHost()
if (lanHost) {
  printTrustUrls({
    baseUrl: `http://${lanHost}:${port}`,
    heading: 'Other devices on your Wi‑Fi:',
  })
} else {
  console.log('(Could not detect a LAN IP — check the Network line from Vite below.)\n')
}

console.log('Press Ctrl+C to stop.\n')

execSync(`npx vite preview --outDir dist-pages --port ${port} --strictPort`, {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, VITE_PREVIEW_MPA: '1' },
})

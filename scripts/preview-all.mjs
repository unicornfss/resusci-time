import { execSync } from 'node:child_process'
import { networkInterfaces } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { printTrustUrls } from './trust-path-urls.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const port = process.env.PREVIEW_PORT ?? '4173'
const includeBlog = process.env.INCLUDE_BLOG === '1'

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

console.log(
  includeBlog
    ? '\nBuilding local preview (with blog)...\n'
    : '\nBuilding local preview (app only — no blog)...\n',
)

execSync('node scripts/build-pages.mjs', {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    INCLUDE_BLOG: includeBlog ? '1' : '0',
  },
})

console.log('\nResusci-Time local preview\n')

printTrustUrls({
  baseUrl: `http://localhost:${port}`,
  heading: 'On this PC (localhost):',
  includeBlog,
})

const lanHost = localLanHost()
if (lanHost) {
  printTrustUrls({
    baseUrl: `http://${lanHost}:${port}`,
    heading: 'Other devices on your Wi‑Fi:',
    includeBlog,
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

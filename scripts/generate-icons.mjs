import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const sourcesDir = join(root, 'assets', 'icon-sources')
const previewDir = join(publicDir, 'preview-icons')
const wmasDir = join(publicDir, 'wmas-icons')

const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'favicon-512.png', size: 512 },
]

async function renderSet(sourcePath, outDir) {
  mkdirSync(outDir, { recursive: true })
  for (const { name, size } of SIZES) {
    await sharp(sourcePath).resize(size, size).png().toFile(join(outDir, name))
  }
}

await renderSet(join(sourcesDir, 'resusci_time_demo.png'), previewDir)
await renderSet(join(sourcesDir, 'resusci_time_wmas.png'), wmasDir)
await renderSet(join(publicDir, 'favicon.svg'), publicDir)
console.log('Generated preview icons in public/preview-icons/ (demo)')
console.log('Generated WMAS live icons in public/wmas-icons/')
console.log('Generated Standard live icons in public/ (from favicon.svg)')

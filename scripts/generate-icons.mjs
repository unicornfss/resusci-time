import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const previewDir = join(publicDir, 'preview-icons')

const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'favicon-512.png', size: 512 },
]

async function renderSet(svgPath, outDir) {
  mkdirSync(outDir, { recursive: true })
  const svg = readFileSync(svgPath)
  for (const { name, size } of SIZES) {
    await sharp(svg).resize(size, size).png().toFile(join(outDir, name))
  }
}

await renderSet(join(publicDir, 'favicon.svg'), publicDir)
await renderSet(join(publicDir, 'favicon-demo.svg'), previewDir)
console.log('Generated live icons in public/ and preview icons in public/preview-icons/')

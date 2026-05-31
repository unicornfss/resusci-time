import sharp from 'sharp'
import { copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const basePath =
  process.argv[2] ??
  join(
    process.env.USERPROFILE ?? '',
    '.cursor/projects/c-Users-jonsk-Projects-cardiac-arrest-protocol/assets/code-shock-wmas-base.png',
  )

const width = 1200
const height = 400

copyFileSync(basePath, join(root, 'blog/images/code-shock-wmas-base.png'))

const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <text x="600" y="182" text-anchor="middle" fill="#7c2d12" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="56" font-weight="900" letter-spacing="2">\u201cCODE SHOCK\u201d</text>
  <text x="600" y="228" text-anchor="middle" fill="#9a3412" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="600">Notify EOC after the first shock</text>
</svg>`)

await sharp(basePath)
  .resize(width, height, { fit: 'cover', position: 'centre' })
  .composite([{ input: overlay, top: 0, left: 0 }])
  .png()
  .toFile(join(root, 'blog/images/code-shock-wmas.png'))

console.log('Wrote blog/images/code-shock-wmas.png')

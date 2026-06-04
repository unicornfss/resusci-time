import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'blog/images/code-shock-wmas.png')
const basePath =
  process.argv[2] ?? join(root, 'blog/images/code-shock-wmas-base.png')

const width = 1200
const height = 400

const overlaySvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="labelShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#fff8e7" flood-opacity="0.95"/>
      <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#431407" flood-opacity="0.45"/>
    </filter>
  </defs>
  <g filter="url(#labelShadow)">
    <text x="600" y="162" text-anchor="middle" fill="#9a3412" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600">
      <tspan x="600" dy="0">Initial rhythm VF / pVT?</tspan>
      <tspan x="600" dy="34" font-size="26">Priority call EOC and declare</tspan>
    </text>
  </g>
  <g transform="translate(600, 248)" filter="url(#labelShadow)">
    <text x="0" y="0" text-anchor="middle" fill="#7c2d12" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="58" font-weight="700" font-style="italic" transform="skewX(-12)">\u201cCODE SHOCK\u201d</text>
  </g>
</svg>`)

const overlay = await sharp(overlaySvg).png().toBuffer()

await sharp(basePath)
  .resize(width, height, { fit: 'cover', position: 'centre' })
  .composite([{ input: overlay, top: 0, left: 0 }])
  .png()
  .toFile(outPath)

console.log(`Wrote ${outPath}`)

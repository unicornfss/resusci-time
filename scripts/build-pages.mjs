import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import trustManifest from '../src/config/trust-manifest.json' with { type: 'json' }
import { buildBlog } from './build-blog.mjs'
import { previewOutputFolder } from './trustPaths.mjs'
import { renderSitePage } from './site-shell.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const buildLiveOnly = process.env.BUILD_LIVE_ONLY === '1'
const buildPreviewOnly = process.env.BUILD_PREVIEW_ONLY === '1'
const buildAll = !buildLiveOnly && !buildPreviewOnly

const outputRoot = process.env.OUTPUT_DIR
  ? resolve(process.env.OUTPUT_DIR)
  : join(root, 'dist-pages')

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const buildLabel = `Version ${packageJson.version} · Last updated ${new Date().toLocaleString('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})}`

const liveLinks = trustManifest
  .map(
    ({ id, label }) =>
      `<li><a href="./${id}/">Resusci-Time ? ${label} version</a></li>`,
  )
  .join('\n        ')

const landingHtml = renderSitePage({
  title: 'Resusci-Time',
  assetPrefix: './',
  body: `
      <h1>Resusci-Time</h1>
      <p>Choose your build:</p>
      <ul class="link-list">
        ${liveLinks}
      </ul>
      <p class="hint">Standard has no trust-specific options. Bookmark the link for your service.</p>
      <ul class="link-list">
        <li><a href="./blog/">Blog ? updates &amp; guides</a></li>
      </ul>
      <p class="version">${buildLabel}</p>
    `,
})

function buildTrustMode(mode, outputFolder) {
  execSync('npm run build:trust -- --mode ' + mode, { cwd: root, stdio: 'inherit' })
  cpSync(join(root, 'dist'), join(outputRoot, outputFolder), { recursive: true })
}

function copyStaticSiteAssets() {
  writeFileSync(join(outputRoot, 'index.html'), landingHtml)

  const backgroundsSrc = join(root, 'public', 'backgrounds')
  if (existsSync(backgroundsSrc)) {
    cpSync(backgroundsSrc, join(outputRoot, 'backgrounds'), { recursive: true })
  }

  buildBlog(outputRoot)

  for (const cnamePath of [join(root, 'public', 'CNAME'), join(root, 'CNAME')]) {
    if (existsSync(cnamePath)) {
      cpSync(cnamePath, join(outputRoot, 'CNAME'))
      break
    }
  }
}

function buildLiveTrusts() {
  for (const { id } of trustManifest) {
    buildTrustMode(id, id)
  }
}

function buildPreviewTrusts() {
  for (const { id } of trustManifest) {
    buildTrustMode(`${id}-preview`, previewOutputFolder(id))
  }
}

if (buildAll) {
  rmSync(outputRoot, { recursive: true, force: true })
  mkdirSync(outputRoot, { recursive: true })
  buildLiveTrusts()
  buildPreviewTrusts()
  copyStaticSiteAssets()
  console.log('Built full dist-pages (live + preview + blog + landing)')
} else if (buildLiveOnly) {
  rmSync(outputRoot, { recursive: true, force: true })
  mkdirSync(outputRoot, { recursive: true })
  buildLiveTrusts()
  copyStaticSiteAssets()
  console.log('Built live dist-pages (from current checkout)')
} else if (buildPreviewOnly) {
  mkdirSync(outputRoot, { recursive: true })
  buildPreviewTrusts()
  console.log('Built preview dist-pages into existing output (from current checkout)')
} else {
  throw new Error('Invalid build flags')
}

if (buildAll || buildLiveOnly) {
  const liveIds = trustManifest.map(({ id }) => id).join(', ')
  console.log(`Live folders: ${liveIds}`)
}
if (buildAll || buildPreviewOnly) {
  const previewIds = trustManifest.map(({ id }) => previewOutputFolder(id)).join(', ')
  console.log(`Preview folders: ${previewIds}`)
}

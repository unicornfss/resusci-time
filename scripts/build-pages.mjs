import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import trustManifest from '../src/config/trust-manifest.json' with { type: 'json' }
import { buildBlog } from './build-blog.mjs'
import { previewOutputFolder, liveOutputFolder } from './trustPaths.mjs'
import { renderSitePage } from './site-shell.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const buildLiveOnly = process.env.BUILD_LIVE_ONLY === '1'
const buildPreviewOnly = process.env.BUILD_PREVIEW_ONLY === '1'
const buildLandingOnly = process.env.BUILD_LANDING_ONLY === '1'
const buildAll = !buildLiveOnly && !buildPreviewOnly && !buildLandingOnly
const includeBlog = process.env.INCLUDE_BLOG !== '0'

const outputRoot = process.env.OUTPUT_DIR
  ? resolve(process.env.OUTPUT_DIR)
  : join(root, 'dist-pages')

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

/** Live landing page label — use LIVE_PACKAGE_VERSION in CI when building landing from testing. */
function getLiveDisplayVersion() {
  const override = process.env.LIVE_PACKAGE_VERSION?.trim()
  return override || packageJson.version
}

function createLandingHtml() {
  const buildLabel = `Version ${getLiveDisplayVersion()} - Last updated ${new Date().toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })}`

  return renderSitePage({
    title: 'Resusci-Time',
    assetPrefix: './',
    includeBlog,
    body: `
      <h1>Resusci-Time</h1>
      <p>Adult cardiac arrest protocol timer and checklist.</p>
      <ul class="link-list">
        <li><a href="./standard/">Open Resusci-Time</a></li>${includeBlog ? '\n        <li><a href="./blog/">Blog - updates &amp; guides</a></li>' : ''}
      </ul>
      <p class="hint">Custom versions for individual ambulance services and NHS trusts are provided by separate arrangement.</p>
      <p class="version">${buildLabel}</p>
    `,
  })
}

function buildTrustMode(mode, outputFolder) {
  execSync('npm run build:trust -- --mode ' + mode, { cwd: root, stdio: 'inherit' })
  cpSync(join(root, 'dist'), join(outputRoot, outputFolder), { recursive: true })
}

function copyStaticSiteAssets() {
  writeFileSync(join(outputRoot, 'index.html'), createLandingHtml())

  const backgroundsSrc = join(root, 'public', 'backgrounds')
  if (existsSync(backgroundsSrc)) {
    cpSync(backgroundsSrc, join(outputRoot, 'backgrounds'), { recursive: true })
  }

  if (includeBlog) {
    buildBlog(outputRoot)
  }

  for (const cnamePath of [join(root, 'public', 'CNAME'), join(root, 'CNAME')]) {
    if (existsSync(cnamePath)) {
      cpSync(cnamePath, join(outputRoot, 'CNAME'))
      break
    }
  }
}

function buildLiveTrusts() {
  for (const { id } of trustManifest) {
    buildTrustMode(id, liveOutputFolder(id))
  }
}

async function buildPreviewTrusts() {
  const { syncPreviewChangelogToPublic } = await import('./sync-preview-changelog.mjs')
  syncPreviewChangelogToPublic()

  for (const { id } of trustManifest) {
    buildTrustMode(`${id}-preview`, previewOutputFolder(id))
  }

  const changelogSrc = join(root, 'public', 'preview-changelog.md')
  if (existsSync(changelogSrc)) {
    for (const { id } of trustManifest) {
      const folder = join(outputRoot, previewOutputFolder(id))
      if (existsSync(folder)) {
        cpSync(changelogSrc, join(folder, 'preview-changelog.md'))
      }
    }
  }

  const { buildPreviewChangelog } = await import('./build-preview-changelog.mjs')
  buildPreviewChangelog(outputRoot)
}

async function main() {
  if (buildAll) {
    rmSync(outputRoot, { recursive: true, force: true })
    mkdirSync(outputRoot, { recursive: true })
    buildLiveTrusts()
    await buildPreviewTrusts()
    copyStaticSiteAssets()
    console.log(`Built full dist-pages (live + preview${includeBlog ? ' + blog' : ''} + landing)`)
  } else if (buildLiveOnly) {
    rmSync(outputRoot, { recursive: true, force: true })
    mkdirSync(outputRoot, { recursive: true })
    buildLiveTrusts()
    copyStaticSiteAssets()
    console.log('Built live dist-pages (from current checkout)')
  } else if (buildPreviewOnly) {
    mkdirSync(outputRoot, { recursive: true })
    await buildPreviewTrusts()
    console.log('Built preview dist-pages into existing output (from current checkout)')
  } else if (buildLandingOnly) {
    mkdirSync(outputRoot, { recursive: true })
    copyStaticSiteAssets()
    console.log(`Built landing page${includeBlog ? ' and blog' : ''} into existing dist-pages (from current checkout)`)
  } else {
    throw new Error('Invalid build flags')
  }

  if (buildAll || buildLiveOnly || buildLandingOnly) {
    console.log(includeBlog ? 'Landing page and blog updated' : 'Landing page updated (blog omitted)')
  }
  if (buildAll || buildLiveOnly) {
    const liveFolders = trustManifest.map(({ id }) => liveOutputFolder(id)).join(', ')
    console.log(`Live folders: ${liveFolders}`)
  }
  if (buildAll || buildPreviewOnly) {
    const previewIds = trustManifest.map(({ id }) => previewOutputFolder(id)).join(', ')
    console.log(`Preview folders: ${previewIds}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

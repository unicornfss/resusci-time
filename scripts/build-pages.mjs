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
/** Blog is hidden by default (governance / preview-only posture). Set INCLUDE_BLOG=1 to rebuild it. */
const includeBlog = process.env.INCLUDE_BLOG === '1'

const outputRoot = process.env.OUTPUT_DIR
  ? resolve(process.env.OUTPUT_DIR)
  : join(root, 'dist-pages')

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const wmasPreviewPath = `./${previewOutputFolder('wmas')}/`

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
      <p>Adult cardiac arrest protocol timer and checklist for <strong>West Midlands Ambulance Service</strong>.</p>
      <ul class="link-list">
        <li><a href="${wmasPreviewPath}">Open preview (approved testers only)</a></li>
        <li><a href="./request-access/">Request preview access</a></li>${includeBlog ? '\n        <li><a href="./blog/">Blog - updates &amp; guides</a></li>' : ''}
      </ul>
      <p class="hint">The preview is for simulation and internal testing only — not for patient contact. It is limited to <strong>approved people</strong> on the access list. If you are not approved, sign-in will fail and you will not be able to open the app — use <a href="./request-access/">Request preview access</a> first. A governance-approved live build is not published yet.</p>
      <p class="version">${buildLabel}</p>
    `,
  })
}

function createRequestAccessHtml() {
  const formUrl = 'https://forms.cloud.microsoft/e/R54hJjwT9m'

  return renderSitePage({
    title: 'Request preview access · Resusci-Time',
    assetPrefix: '../',
    includeBlog: false,
    body: `
      <h1>Request preview access</h1>
      <p>
        The Resusci-Time preview is for simulation and internal testing only. Access is limited to
        an approved list. Approval normally requires a
        <strong>WMAS work email ending in @wmas.nhs.uk</strong>.
      </p>
      <p>
        Use the Microsoft Form below to request access. Submissions are reviewed before anyone is
        added — sending a request does not grant access automatically.
      </p>
      <div class="form-embed">
        <iframe
          title="Resusci-Time preview access request"
          src="${formUrl}"
          loading="lazy"
          allowfullscreen
        ></iframe>
      </div>
      <p class="hint">
        If the form does not load, open it in a new tab:
        <a href="${formUrl}" target="_blank" rel="noopener noreferrer">Request preview access (Microsoft Form)</a>.
        You can also ask a working-group member to pass your details on for you.
      </p>
      <a class="back-link" href="../">← Home</a>
    `,
  })
}

function createRequestAccessThanksHtml() {
  return renderSitePage({
    title: 'Request preview access · Resusci-Time',
    assetPrefix: '../../',
    includeBlog: false,
    body: `
      <h1>Request preview access</h1>
      <p>Use the request page to open the access form.</p>
      <ul class="link-list">
        <li><a href="../">Request preview access</a></li>
        <li><a href="../../">Home</a></li>
      </ul>
    `,
  })
}

function writeRequestAccessPages() {
  const dir = join(outputRoot, 'request-access')
  const thanksDir = join(dir, 'thanks')
  mkdirSync(thanksDir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), createRequestAccessHtml())
  writeFileSync(join(thanksDir, 'index.html'), createRequestAccessThanksHtml())
}

function createWorkInProgressHtml() {
  return renderSitePage({
    title: 'Resusci-Time — work in progress',
    assetPrefix: '../',
    includeBlog: false,
    body: `
      <h1>Work in progress</h1>
      <p>This page is not in use.</p>
      <ul class="link-list">
        <li><a href="../${previewOutputFolder('wmas')}/">Open Resusci-Time preview</a></li>
        <li><a href="../request-access/">Request preview access</a></li>
        <li><a href="../">Home</a></li>
      </ul>
    `,
  })
}

function createLivePlaceholderHtml() {
  const wmasPreviewFromLive = `../${previewOutputFolder('wmas')}/`
  return renderSitePage({
    title: 'Resusci-Time — approved build not yet available',
    assetPrefix: '../',
    includeBlog: false,
    body: `
      <h1>Approved build not yet available</h1>
      <p>
        This address is reserved for the <strong>governance-approved</strong> version of
        Resusci-Time for West Midlands Ambulance Service — the build that has completed the Trust
        clinical governance process.
      </p>
      <p>
        That approved release is <strong>not ready yet</strong>. While the route and governance
        work continue, the working application for simulation and internal testing is the
        <strong>preview</strong> build, which may include unapproved changes and requires sign-in.
      </p>
      <ul class="link-list">
        <li><a href="${wmasPreviewFromLive}">Open preview (approved testers only)</a></li>
        <li><a href="../request-access/">Request preview access</a></li>
        <li><a href="../">Back to home</a></li>
      </ul>
      <p class="hint">The preview is limited to approved people on the access list. If you are not approved, you will not be able to open it — request access first. Do not use Resusci-Time for real patient contact until a governance-approved build is published at this address.</p>
    `,
  })
}

function buildTrustMode(mode, outputFolder) {
  execSync('npm run build:trust -- --mode ' + mode, { cwd: root, stdio: 'inherit' })
  cpSync(join(root, 'dist'), join(outputRoot, outputFolder), { recursive: true })
}

function writeLivePlaceholders() {
  for (const { id } of trustManifest) {
    const folder = join(outputRoot, liveOutputFolder(id))
    mkdirSync(folder, { recursive: true })
    const html = id === 'standard' ? createWorkInProgressHtml() : createLivePlaceholderHtml()
    writeFileSync(join(folder, 'index.html'), html)
  }
}

function copyStaticSiteAssets() {
  writeFileSync(join(outputRoot, 'index.html'), createLandingHtml())
  writeRequestAccessPages()

  const backgroundsSrc = join(root, 'public', 'backgrounds')
  if (existsSync(backgroundsSrc)) {
    cpSync(backgroundsSrc, join(outputRoot, 'backgrounds'), { recursive: true })
  }

  if (includeBlog) {
    buildBlog(outputRoot)
  } else {
    rmSync(join(outputRoot, 'blog'), { recursive: true, force: true })
  }

  for (const cnamePath of [join(root, 'public', 'CNAME'), join(root, 'CNAME')]) {
    if (existsSync(cnamePath)) {
      cpSync(cnamePath, join(outputRoot, 'CNAME'))
      break
    }
  }
}

function buildLiveTrusts() {
  // Live / "approved" URLs stay as bookmarks but show a placeholder until governance signs off.
  writeLivePlaceholders()
}

async function buildPreviewTrusts() {
  const { syncPreviewChangelogToPublic } = await import('./sync-preview-changelog.mjs')
  syncPreviewChangelogToPublic()

  for (const { id } of trustManifest) {
    if (id === 'standard') {
      const folder = join(outputRoot, previewOutputFolder(id))
      mkdirSync(folder, { recursive: true })
      writeFileSync(join(folder, 'index.html'), createWorkInProgressHtml())
      continue
    }
    buildTrustMode(`${id}-preview`, previewOutputFolder(id))
  }

  const changelogSrc = join(root, 'public', 'preview-changelog.md')
  if (existsSync(changelogSrc)) {
    for (const { id } of trustManifest) {
      if (id === 'standard') continue
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
    console.log(`Built full dist-pages (live placeholders + preview${includeBlog ? ' + blog' : ''} + landing)`)
  } else if (buildLiveOnly) {
    rmSync(outputRoot, { recursive: true, force: true })
    mkdirSync(outputRoot, { recursive: true })
    buildLiveTrusts()
    copyStaticSiteAssets()
    console.log('Built live dist-pages placeholders (from current checkout)')
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
    console.log(`Live placeholder folders: ${liveFolders}`)
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

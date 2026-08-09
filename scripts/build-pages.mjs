import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import trustManifest from '../src/config/trust-manifest.json' with { type: 'json' }
import { buildBlog } from './build-blog.mjs'
import { previewOutputFolder, liveOutputFolder } from './trustPaths.mjs'
import { renderSitePage } from './site-shell.mjs'
import { PRODUCTION_SITE_BASE } from './trust-path-urls.mjs'

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
const ACCESS_REQUEST_EMAIL = 'jon.ostrowski@wmas.nhs.uk'
const SITE_ORIGIN = PRODUCTION_SITE_BASE.replace(/\/$/, '')

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
        <li><a href="${wmasPreviewPath}">Open preview (testing only)</a></li>
        <li><a href="./request-access/">Request preview access</a></li>${includeBlog ? '\n        <li><a href="./blog/">Blog - updates &amp; guides</a></li>' : ''}
      </ul>
      <p class="hint">The live / approved address is reserved for a future governance-approved build. Until then, use the preview for simulation and internal testing only — not for patient contact. Sign-in with an approved work email is required for the preview.</p>
      <p class="version">${buildLabel}</p>
    `,
  })
}

function createRequestAccessHtml() {
  const thanksUrl = `${SITE_ORIGIN}/request-access/thanks/`
  return renderSitePage({
    title: 'Request preview access · Resusci-Time',
    assetPrefix: '../',
    includeBlog: false,
    body: `
      <h1>Request preview access</h1>
      <p>
        The Resusci-Time preview is for simulation and internal testing only. It is signed-in
        access for people on an approved email list (usually a WMAS work email).
      </p>
      <p class="hint">
        Submit this form to ask to be added. Requests are reviewed before access is granted —
        submitting does not open the preview automatically. You can also ask a working-group
        member to pass your details to Jon Ostrowski.
      </p>
      <form class="site-form" action="https://formsubmit.co/${ACCESS_REQUEST_EMAIL}" method="POST">
        <input type="hidden" name="_subject" value="Resusci-Time preview access request" />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_next" value="${thanksUrl}" />
        <input type="hidden" name="_captcha" value="false" />
        <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" />

        <label>
          Full name
          <input type="text" name="name" required autocomplete="name" />
        </label>
        <label>
          Work email
          <input type="email" name="email" required autocomplete="email" />
        </label>
        <label>
          Role / team <span class="optional">(optional)</span>
          <input type="text" name="role" autocomplete="organization-title" />
        </label>
        <label>
          Why do you need access?
          <textarea name="reason" required maxlength="2000" placeholder="e.g. working-group testing, clinical review"></textarea>
        </label>
        <label>
          Working-group member who referred you <span class="optional">(optional)</span>
          <input type="text" name="referred_by" />
        </label>
        <button type="submit">Send request</button>
      </form>
      <a class="back-link" href="../">← Home</a>
    `,
  })
}

function createRequestAccessThanksHtml() {
  return renderSitePage({
    title: 'Request sent · Resusci-Time',
    assetPrefix: '../../',
    includeBlog: false,
    body: `
      <h1>Request sent</h1>
      <p>
        Thank you. Your request has been submitted for review. If access is granted, you will be
        able to sign in at the preview link using the email address you provided.
      </p>
      <ul class="link-list">
        <li><a href="../../${previewOutputFolder('wmas')}/">Open preview</a></li>
        <li><a href="../../">Home</a></li>
      </ul>
      <p class="hint">Allow time for the request to be checked. Check junk mail if you expected a reply and have not heard back.</p>
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
        <li><a href="${wmasPreviewFromLive}">Open preview (testing / simulation only)</a></li>
        <li><a href="../request-access/">Request preview access</a></li>
        <li><a href="../">Back to home</a></li>
      </ul>
      <p class="hint">Do not use Resusci-Time for real patient contact until a governance-approved build is published at this address.</p>
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

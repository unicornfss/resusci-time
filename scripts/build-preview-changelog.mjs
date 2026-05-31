import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import { renderSitePage } from './site-shell.mjs'
import { syncPreviewChangelogToPublic } from './sync-preview-changelog.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const changelogPath = join(root, 'TESTING-CHANGELOG.md')

marked.setOptions({ gfm: true, breaks: false })

const fallbackBody = `
<p class="hint">No preview changelog is available for this deploy.</p>
<p>Update <code>TESTING-CHANGELOG.md</code> on the <code>testing</code> branch to list unreleased preview changes.</p>
`

export function buildPreviewChangelog(outputRoot) {
  syncPreviewChangelogToPublic()

  const outDir = join(outputRoot, 'preview-changelog')
  mkdirSync(outDir, { recursive: true })

  let proseHtml = fallbackBody
  if (existsSync(changelogPath)) {
    const raw = readFileSync(changelogPath, 'utf8')
    const body = raw.replace(/^---[\s\S]*?---\s*/m, '').trim()
    if (body) {
      proseHtml = `<div class="prose">${marked.parse(body)}</div>`
    }
  }

  const pageBody = `
      <article>
        <h1>Preview build changes</h1>
        <p class="hint">Unreleased features on preview URLs — not yet announced on the live blog.</p>
        ${proseHtml}
        <a class="back-link" href="../blog/">Published release notes (blog)</a>
      </article>
    `

  writeFileSync(
    join(outDir, 'index.html'),
    renderSitePage({
      title: 'Preview changes · Resusci-Time',
      assetPrefix: '../',
      body: pageBody,
      wide: true,
      includeBlog: true,
    }),
  )

  console.log('Built preview-changelog/')
}

import { copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'TESTING-CHANGELOG.md')
const target = join(root, 'public', 'preview-changelog.md')

export function syncPreviewChangelogToPublic() {
  if (!existsSync(source)) {
    console.warn('sync-preview-changelog: TESTING-CHANGELOG.md not found — skipped')
    return
  }
  copyFileSync(source, target)
  console.log('Synced TESTING-CHANGELOG.md → public/preview-changelog.md')
}

if (process.argv[1]?.endsWith('sync-preview-changelog.mjs')) {
  syncPreviewChangelogToPublic()
}

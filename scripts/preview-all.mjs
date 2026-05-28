import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

execSync('npx vite preview --outDir dist-pages', {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, VITE_PREVIEW_MPA: '1' },
})

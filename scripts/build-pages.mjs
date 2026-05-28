import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = join(root, 'dist-pages')

const landingHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#1f4f1f" />
    <title>Resusci-Time</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #dfe8df;
        --panel: #f4f8f4;
        --text: #1a2e1a;
        --accent: #2d6a2d;
        --border: #b8c9b8;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        background: var(--bg);
        color: var(--text);
        display: grid;
        place-items: center;
        padding: 1.5rem;
      }
      main {
        width: min(100%, 32rem);
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1.75rem;
        box-shadow: 0 8px 24px rgba(26, 46, 26, 0.08);
      }
      h1 { margin: 0 0 0.35rem; font-size: 1.65rem; }
      p { margin: 0 0 1.25rem; line-height: 1.5; }
      ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75rem; }
      a {
        display: block;
        padding: 0.9rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: #fff;
        color: var(--accent);
        text-decoration: none;
        font-weight: 600;
      }
      a:hover, a:focus-visible { border-color: var(--accent); outline: none; }
      .hint { font-size: 0.9rem; opacity: 0.85; margin-top: 1rem; }
    </style>
  </head>
  <body>
    <main>
      <h1>Resusci-Time</h1>
      <p>Choose your ambulance service build:</p>
      <ul>
        <li><a href="./wmas/">Resusci-Time — WMAS version</a></li>
        <li><a href="./emas/">Resusci-Time — EMAS version</a></li>
      </ul>
      <p class="hint">Bookmark the link for your trust. Each build is configured for that service's protocol variations.</p>
    </main>
  </body>
</html>
`

rmSync(outputRoot, { recursive: true, force: true })
mkdirSync(outputRoot, { recursive: true })

for (const trust of ['wmas', 'emas']) {
  execSync(`npm run build:${trust}`, { cwd: root, stdio: 'inherit' })
  cpSync(join(root, 'dist'), join(outputRoot, trust), { recursive: true })
}

writeFileSync(join(outputRoot, 'index.html'), landingHtml)

for (const cnamePath of [join(root, 'public', 'CNAME'), join(root, 'CNAME')]) {
  if (existsSync(cnamePath)) {
    cpSync(cnamePath, join(outputRoot, 'CNAME'))
    break
  }
}

console.log('Built dist-pages with wmas/, emas/, and landing index.html')

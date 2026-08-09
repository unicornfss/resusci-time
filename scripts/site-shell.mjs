export const defaultBrandBackground = 'backgrounds/resusci-time-logo.png'

export function siteStyles(assetPrefix = './') {
  const brandBg = `${assetPrefix}${defaultBrandBackground}`
  return `
      :root {
        color-scheme: light;
        --bg: #dfe8df;
        --panel: #f4f8f4;
        --text: #1a2e1a;
        --text-muted: #4a5f4a;
        --accent: #2d6a2d;
        --border: #b8c9b8;
        --brand-bg-image: url('${brandBg}');
        --brand-bg-opacity: 0.24;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        background: var(--bg);
        color: var(--text);
        padding: 1.5rem;
        position: relative;
        line-height: 1.5;
      }
      body::before {
        content: '';
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background: var(--brand-bg-image) center / min(85vw, 540px) no-repeat;
        opacity: var(--brand-bg-opacity);
      }
      .page {
        position: relative;
        z-index: 1;
        width: min(100%, 40rem);
        margin: 0 auto;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 1.75rem;
        box-shadow: 0 8px 24px rgba(26, 46, 26, 0.08);
      }
      .page.wide { width: min(100%, 48rem); }
      .site-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 1rem;
        margin-bottom: 1.25rem;
        font-size: 0.9rem;
      }
      .site-nav a {
        color: var(--accent);
        font-weight: 600;
        text-decoration: none;
      }
      .site-nav a:hover, .site-nav a:focus-visible { text-decoration: underline; outline: none; }
      .site-nav .sep { color: var(--text-muted); user-select: none; }
      h1 { margin: 0 0 0.35rem; font-size: 1.65rem; line-height: 1.25; }
      h2 { margin: 1.75rem 0 0.75rem; font-size: 1.15rem; }
      h2:first-child { margin-top: 0; }
      p { margin: 0 0 1rem; }
      ul, ol { margin: 0 0 1rem; padding-left: 1.35rem; }
      li { margin-bottom: 0.35rem; }
      .hint { font-size: 0.9rem; color: var(--text-muted); margin-top: 1rem; }
      .version { font-size: 0.8rem; color: var(--text-muted); margin-top: 1.25rem; margin-bottom: 0; }
      .link-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75rem; }
      .link-list a {
        display: block;
        padding: 0.9rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: #fff;
        color: var(--accent);
        text-decoration: none;
        font-weight: 600;
      }
      .link-list a:hover, .link-list a:focus-visible { border-color: var(--accent); outline: none; }
      .post-card {
        display: block;
        padding: 1rem 1.1rem;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: #fff;
        color: inherit;
        text-decoration: none;
      }
      .post-card:hover, .post-card:focus-visible { border-color: var(--accent); outline: none; }
      .post-card h3 { margin: 0 0 0.35rem; font-size: 1.05rem; color: var(--accent); }
      .post-card p { margin: 0; font-size: 0.92rem; color: var(--text-muted); font-weight: 400; }
      .post-meta { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1rem; }
      .badge {
        display: inline-block;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        padding: 0.15rem 0.45rem;
        border-radius: 4px;
        margin-right: 0.35rem;
        vertical-align: middle;
      }
      .badge-news { background: #dbeafe; color: #1e40af; }
      .badge-guide { background: #dcfce7; color: #166534; }
      .post-grid { display: grid; gap: 0.75rem; margin-bottom: 1.5rem; }
      .prose h2 { margin-top: 1.5rem; }
      .prose h3 { margin: 1.25rem 0 0.5rem; font-size: 1rem; }
      .prose code {
        font-family: ui-monospace, Consolas, monospace;
        font-size: 0.88em;
        background: #e8f0e8;
        padding: 0.1rem 0.35rem;
        border-radius: 4px;
      }
      .prose pre {
        background: #1a2e1a;
        color: #e8f0e8;
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
        margin: 0 0 1rem;
      }
      .prose pre code { background: none; padding: 0; color: inherit; }
      .prose a { color: var(--accent); }
      .prose img {
        display: block;
        max-width: 100%;
        height: auto;
        margin: 1rem auto;
        border-radius: 8px;
        border: 1px solid var(--border);
        box-shadow: 0 4px 16px rgba(26, 46, 26, 0.1);
      }
      .prose figure { margin: 1.25rem 0; }
      .prose figcaption {
        margin-top: 0.5rem;
        font-size: 0.85rem;
        color: var(--text-muted);
        text-align: center;
      }
      .back-link { display: inline-block; margin-top: 1.5rem; font-weight: 600; color: var(--accent); }
      .site-form { display: flex; flex-direction: column; gap: 0.85rem; margin: 1rem 0 0; }
      .site-form label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text);
      }
      .site-form input,
      .site-form textarea,
      .site-form select {
        width: 100%;
        min-height: 2.75rem;
        padding: 0.65rem 0.75rem;
        border-radius: 10px;
        border: 2px solid var(--border);
        background: #fff;
        color: var(--text);
        font: inherit;
      }
      .site-form textarea { min-height: 6.5rem; resize: vertical; }
      .site-form input:focus-visible,
      .site-form textarea:focus-visible,
      .site-form select:focus-visible {
        outline: none;
        border-color: var(--accent);
      }
      .site-form .optional { font-weight: 500; color: var(--text-muted); }
      .site-form button[type="submit"] {
        margin-top: 0.35rem;
        min-height: 3rem;
        border: none;
        border-radius: 12px;
        background: var(--accent);
        color: #fff;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }
      .site-form button[type="submit"]:hover,
      .site-form button[type="submit"]:focus-visible {
        filter: brightness(1.05);
        outline: none;
      }
      .hp {
        position: absolute;
        left: -10000px;
        top: auto;
        width: 1px;
        height: 1px;
        overflow: hidden;
      }
`
}

export function renderSitePage({ title, assetPrefix = './', body, wide = false, includeBlog = false }) {
  const homeHref = assetPrefix
  const blogHref = `${assetPrefix}blog/`
  const blogNav = includeBlog
    ? `<span class="sep" aria-hidden="true">·</span>
        <a href="${blogHref}">Blog</a>`
    : ''
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#1f4f1f" />
    <title>${title}</title>
    <style>${siteStyles(assetPrefix)}</style>
  </head>
  <body>
    <div class="page${wide ? ' wide' : ''}">
      <nav class="site-nav" aria-label="Site">
        <a href="${homeHref}">Home</a>${blogNav}
      </nav>
      ${body}
    </div>
  </body>
</html>
`
}

export function categoryBadge(category) {
  if (category === 'guide') {
    return '<span class="badge badge-guide">Guide</span>'
  }
  return '<span class="badge badge-news">Update</span>'
}

export function formatDate(isoDate) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-GB', {
    dateStyle: 'long',
  })
}

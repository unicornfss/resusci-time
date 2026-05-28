import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import { categoryBadge, formatDate, renderSitePage } from './site-shell.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const postsDir = join(root, 'blog', 'posts')
const blogImagesDir = join(root, 'blog', 'images')

marked.setOptions({ gfm: true, breaks: false })

/** @param {string | undefined} raw */
function normalizeAudience(raw) {
  if (!raw || !raw.trim() || raw.trim().toLowerCase() === 'all') {
    return 'all'
  }

  const parts = raw
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)

  return parts.length > 0 ? parts.join(',') : 'all'
}

function parseFrontmatter(content, filename) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    throw new Error(`Missing frontmatter in ${filename}`)
  }

  const meta = {}
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const colon = trimmed.indexOf(':')
    if (colon === -1) continue
    const key = trimmed.slice(0, colon).trim()
    const value = trimmed.slice(colon + 1).trim()
    meta[key] = value
  }

  return { meta, body: match[2] }
}

function loadPosts() {
  if (!existsSync(postsDir)) return []

  return readdirSync(postsDir)
    .filter((name) => name.endsWith('.md'))
    .map((filename) => {
      const raw = readFileSync(join(postsDir, filename), 'utf8')
      const { meta, body } = parseFrontmatter(raw, filename)
      const slug = meta.slug || basename(filename, '.md')
      const category = meta.category === 'guide' ? 'guide' : 'news'

      if (!meta.title || !meta.date) {
        throw new Error(`Post ${filename} requires title and date in frontmatter`)
      }

      return {
        slug,
        title: meta.title,
        date: meta.date,
        category,
        summary: meta.summary || '',
        audience: normalizeAudience(meta.audience),
        body,
        html: marked.parse(body),
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

function renderPostList(posts, assetPrefix) {
  if (posts.length === 0) {
    return '<p class="hint">No posts yet.</p>'
  }

  return `<div class="post-grid">${posts
    .map(
      (post) => `<a class="post-card" data-audience="${post.audience}" href="${assetPrefix}posts/${post.slug}.html">
        <h3>${categoryBadge(post.category)}${post.title}</h3>
        <p>${post.summary || ''}</p>
      </a>`,
    )
    .join('')}</div>`
}

const blogAudienceFilterScript = `
<script>
(function () {
  var params = new URLSearchParams(window.location.search);
  var trust = (params.get('trust') || 'standard').toLowerCase();

  function isVisible(audience) {
    var list = audience.split(',').map(function (part) { return part.trim().toLowerCase(); });
    return list.indexOf('all') !== -1 || list.indexOf(trust) !== -1;
  }

  document.querySelectorAll('[data-audience]').forEach(function (el) {
    if (!isVisible(el.getAttribute('data-audience') || 'all')) {
      el.style.display = 'none';
    }
  });

  ['Latest updates', 'Guides'].forEach(function (headingText) {
    document.querySelectorAll('h2').forEach(function (heading) {
      if (heading.textContent !== headingText) return;
      var grid = heading.nextElementSibling;
      if (!grid || !grid.classList.contains('post-grid')) return;
      var anyVisible = false;
      grid.querySelectorAll('[data-audience]').forEach(function (card) {
        if (card.style.display !== 'none') anyVisible = true;
      });
      if (!anyVisible) {
        heading.style.display = 'none';
        grid.style.display = 'none';
      }
    });
  });
})();
</script>`

export function buildBlog(outputRoot) {
  const posts = loadPosts()
  const blogRoot = join(outputRoot, 'blog')
  const postsOut = join(blogRoot, 'posts')
  mkdirSync(postsOut, { recursive: true })

  if (existsSync(blogImagesDir)) {
    cpSync(blogImagesDir, join(blogRoot, 'images'), { recursive: true })
  }

  const news = posts.filter((post) => post.category === 'news')
  const guides = posts.filter((post) => post.category === 'guide')

  const indexBody = `
      <h1>Resusci-Time blog</h1>
      <p>Updates, release notes, and guides for using the app in practice.</p>
      <p class="hint" id="blog-audience-note">Showing posts for the <strong>Standard</strong> build.</p>
      <h2>Latest updates</h2>
      ${renderPostList(news, './')}
      <h2>Guides</h2>
      ${renderPostList(guides, './')}
      ${blogAudienceFilterScript}
      <script>
        (function () {
          var trust = (new URLSearchParams(window.location.search).get('trust') || 'standard').toLowerCase();
          var labels = { standard: 'Standard', wmas: 'WMAS', emas: 'EMAS' };
          var label = labels[trust] || trust.toUpperCase();
          var note = document.getElementById('blog-audience-note');
          if (note) note.innerHTML = 'Showing posts for the <strong>' + label + '</strong> build.';
        })();
      </script>
    `

  writeFileSync(join(blogRoot, 'index.html'), renderSitePage({
    title: 'Resusci-Time blog',
    assetPrefix: '../',
    body: indexBody,
    wide: true,
  }))

  for (const post of posts) {
    const postBody = `
      <article>
        <h1>${post.title}</h1>
        <p class="post-meta">${categoryBadge(post.category)}${formatDate(post.date)}</p>
        <div class="prose">${post.html}</div>
        <a class="back-link" href="../">← Back to blog</a>
      </article>
    `

    writeFileSync(
      join(postsOut, `${post.slug}.html`),
      renderSitePage({
        title: `${post.title} · Resusci-Time`,
        assetPrefix: '../../',
        body: postBody,
        wide: true,
      }),
    )
  }

  console.log(`Built blog with ${posts.length} post(s) at blog/`)
}

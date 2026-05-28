import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import { categoryBadge, formatDate, renderSitePage } from './site-shell.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const postsDir = join(root, 'blog', 'posts')
const blogImagesDir = join(root, 'blog', 'images')

marked.setOptions({ gfm: true, breaks: false })

function parseFrontmatter(content, filename) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    throw new Error(`Missing frontmatter in ${filename}`)
  }

  const meta = {}
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
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
      (post) => `<a class="post-card" href="${assetPrefix}posts/${post.slug}.html">
        <h3>${categoryBadge(post.category)}${post.title}</h3>
        <p>${post.summary || ''}</p>
      </a>`,
    )
    .join('')}</div>`
}

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
      <h2>Latest updates</h2>
      ${renderPostList(news, './')}
      <h2>Guides</h2>
      ${renderPostList(guides, './')}
      <p class="hint">New posts are published when changes are pushed to the main branch.</p>
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

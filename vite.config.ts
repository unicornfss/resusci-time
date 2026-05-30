import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildWebManifest, getServiceConfig } from './src/config/getServiceConfig'
import { isTrustId, liveOutputFolder, parseViteMode, previewOutputFolder, TRUST_IDS } from './src/config/trustIds'
import type { TrustId } from './src/config/types'

const packageJson = JSON.parse(
  readFileSync(resolve(fileURLToPath(new URL('.', import.meta.url)), 'package.json'), 'utf8'),
) as { version: string }

const appVersion = packageJson.version
const appBuildIso = new Date().toISOString()

function resolveTrustId(mode: string): TrustId {
  const parsed = parseViteMode(mode)
  if (parsed.trustId) return parsed.trustId

  const fromEnv = process.env.VITE_TRUST
  if (fromEnv && isTrustId(fromEnv)) return fromEnv

  return 'wmas'
}

function isTrustProductionMode(mode: string): boolean {
  const parsed = parseViteMode(mode)
  return parsed.trustId !== null
}

function trustBuildPlugin(trustId: TrustId, channel: 'live' | 'preview'): Plugin {
  const config = getServiceConfig(trustId, channel)
  const manifestJson = `${JSON.stringify(buildWebManifest(config), null, 2)}\n`

  return {
    name: 'trust-build',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] === '/manifest.webmanifest') {
          res.setHeader('Content-Type', 'application/manifest+json')
          res.end(manifestJson)
          return
        }
        next()
      })
    },
    transformIndexHtml() {
      const iconPrefix = config.isPreview ? 'preview-icons/' : ''
      return [
        { tag: 'title', children: config.pageTitle, injectTo: 'head' },
        {
          tag: 'meta',
          attrs: { name: 'apple-mobile-web-app-title', content: config.pageTitle },
          injectTo: 'head',
        },
        {
          tag: 'link',
          attrs: { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${iconPrefix}favicon-32x32.png` },
          injectTo: 'head',
        },
        {
          tag: 'link',
          attrs: { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${iconPrefix}favicon-16x16.png` },
          injectTo: 'head',
        },
        {
          tag: 'link',
          attrs: { rel: 'apple-touch-icon', sizes: '180x180', href: `${iconPrefix}apple-touch-icon.png` },
          injectTo: 'head',
        },
      ]
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.webmanifest',
        source: manifestJson,
      })
    },
  }
}

function multiPagePreviewPlugin(): Plugin {
  const folders = [
    ...TRUST_IDS.map((id) => liveOutputFolder(id)),
    ...TRUST_IDS.map((id) => previewOutputFolder(id)),
    'blog',
  ]

  return {
    name: 'multi-page-preview',
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? ''
        const query = req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
        const bare = pathname.replace(/^\//, '')
        if (folders.includes(bare)) {
          res.writeHead(301, { Location: `${pathname}/${query}` })
          res.end()
          return
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const { trustId, channel } = parseViteMode(mode)
  const resolvedTrustId = trustId ?? resolveTrustId(mode)
  const resolvedChannel = trustId ? channel : mode === 'production' ? 'live' : channel
  const isProductionBuild = mode === 'production' || isTrustProductionMode(mode)
  const isMultiPagePreview = process.env.VITE_PREVIEW_MPA === '1'

  return {
    appType: isMultiPagePreview ? 'mpa' : 'spa',
    plugins: [
      react(),
      trustBuildPlugin(resolvedTrustId, resolvedChannel),
      ...(isMultiPagePreview ? [multiPagePreviewPlugin()] : []),
    ],
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
      __APP_BUILD_ISO__: JSON.stringify(appBuildIso),
    },
    base: isProductionBuild ? './' : '/',
    server: {
      host: true,
    },
    preview: {
      host: true,
    },
  }
})

import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildWebManifest, getServiceConfig } from './src/config/getServiceConfig'
import { isTrustId, parseViteMode } from './src/config/trustIds'
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
      return [
        { tag: 'title', children: config.pageTitle, injectTo: 'head' },
        {
          tag: 'meta',
          attrs: { name: 'apple-mobile-web-app-title', content: config.pageTitle },
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

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const { trustId, channel } = parseViteMode(mode)
  const resolvedTrustId = trustId ?? resolveTrustId(mode)
  const resolvedChannel = trustId ? channel : mode === 'production' ? 'live' : channel
  const isProductionBuild = mode === 'production' || isTrustProductionMode(mode)

  return {
    plugins: [react(), trustBuildPlugin(resolvedTrustId, resolvedChannel)],
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

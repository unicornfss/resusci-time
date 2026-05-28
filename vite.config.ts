import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { getServiceConfig, buildWebManifest, isTrustId } from './src/config/getServiceConfig'
import type { TrustId } from './src/config/types'

function resolveTrustId(mode: string): TrustId {
  if (mode === 'emas') return 'emas'
  if (mode === 'wmas') return 'wmas'
  const fromEnv = process.env.VITE_TRUST
  if (fromEnv && isTrustId(fromEnv)) return fromEnv
  return 'wmas'
}

function trustBuildPlugin(trustId: TrustId): Plugin {
  const config = getServiceConfig(trustId)
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
  const trustId = resolveTrustId(mode)
  const isProductionBuild = mode === 'production' || mode === 'wmas' || mode === 'emas'

  return {
    plugins: [react(), trustBuildPlugin(trustId)],
    // Relative base works for both github.io/repo/ and custom-domain subpaths (CNAME).
    base: isProductionBuild ? './' : '/',
  }
})

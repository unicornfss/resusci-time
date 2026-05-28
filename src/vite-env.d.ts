/// <reference types="vite/client" />

declare const __APP_VERSION__: string
declare const __APP_BUILD_ISO__: string

interface ImportMetaEnv {
  readonly VITE_TRUST: 'wmas' | 'emas' | 'standard'
  readonly VITE_BUILD_CHANNEL?: 'live' | 'preview'
  readonly VITE_TIME_SCALE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

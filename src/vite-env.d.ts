/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRUST: 'wmas' | 'emas'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

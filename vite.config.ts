import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Relative base works for both github.io/repo/ and custom-domain root (CNAME).
  base: mode === 'production' ? './' : '/',
}))

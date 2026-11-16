import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `vite preview` serves the same security headers as production (vercel.json), so CSP issues show up locally.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[]
}
const securityHeaders = Object.fromEntries(
  vercel.headers.find((h) => h.source === '/(.*)')!.headers
    .filter((h) => h.key !== 'Strict-Transport-Security')
    .map((h) => [h.key, h.value.replace('; upgrade-insecure-requests', '')]),
)

export default defineConfig({
  plugins: [react()],
  build: {
    // Keep font slices as separate files: the browser downloads only the unicode ranges a page uses.
    assetsInlineLimit: 0,
    sourcemap: false,
  },
  preview: { headers: securityHeaders },
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/extension/manifest.json' with { type: 'json' }

// Silence CRXJS direct console warnings
const originalWarn = console.warn
const originalLog = console.log

const isCrxWarning = (msg: unknown) =>
  typeof msg === 'string' &&
  (msg.includes('Some document_start content scripts use the async loader') ||
   msg.includes('[crx:manifest]'))

console.warn = (...args: unknown[]) => {
  if (isCrxWarning(args[0])) return
  originalWarn(...args)
}

console.log = (...args: unknown[]) => {
  if (isCrxWarning(args[0])) return
  originalLog(...args)
}

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: './public',
  define: {
    'process.env': {}
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      stream: 'stream-browserify',
      http: 'http-browserify',
      https: 'https-browserify',
      util: 'util'
    }
  },
  build: {
    rollupOptions: {
      // plugins: [nodePolyfills()],
      input: {
        ['eval-sandbox']: 'eval-sandbox.html',
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    cssMinify: 'esbuild', 
    commonjsOptions: {
      transformMixedEsModules: true
    },
  },
  plugins: [
    crx({ manifest: manifest as any }),
    vue()
  ],
  server: {
    port: 4766
  }
})

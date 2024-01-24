import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/extension/manifest.json'

const production = process.env.NODE_ENV === 'production'

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
      plugins: [nodePolyfills()],
      input: {
        ['eval-sandbox']: 'eval-sandbox.html',
      },
    },
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true
    },
  },
  plugins: [
    !production &&
    nodePolyfills({
      include: ['node_modules/**/*.js', new RegExp('node_modules/.vite/.*js')]
    }),
    crx({ manifest }),
    vue()
  ],
  server: {
    port: 4766
  }
})

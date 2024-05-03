import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/extension/manifest.json'

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
      onwarn: (warning) => {
        if (warning.message.includes('comment will be removed')) {
          return false;
        }
        return true;
      },
      input: {
        ['eval-sandbox']: 'eval-sandbox.html',
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true
    },
  },
  esbuild: {
    legalComments: 'none',
  },
  plugins: [
    crx({ manifest: manifest as any }),
    vue()
  ],
  server: {
    port: 4766
  }
})

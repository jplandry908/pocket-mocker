import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'
import pocketMockPlugin from './vite-plugin-pocket-mock' // Keep our custom plugin

export default defineConfig({
  plugins: [
    svelte({
      // Key: Tell Svelte compiler to compile component CSS into JS strings
      // This way styles in Dashboard.svelte will be bundled into JS
      compilerOptions: {
        css: 'injected',
      },
      emitCss: false, // Don't generate separate CSS files
    }),
    pocketMockPlugin()
  ],
  build: {
    // Enable library mode
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'PocketMock', // Global variable name for UMD mode
      fileName: (format) => `pocket-mock.${format}.js` // Output file name
    },
    rollupOptions: {
      // Ensure externalization of dependencies you don't want to bundle in the library
      // For this project, we want it to be zero-dependency (Standalone), so keep it empty
      external: [],
      output: {
        // Provide global variables for these externalized dependencies in UMD build mode
        globals: {}
      }
    }
  }
})
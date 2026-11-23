/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Large libraries change rarely; separate chunks stay cached across app releases.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('aws-amplify') || id.includes('@aws-amplify') || id.includes('@aws-sdk') || id.includes('@smithy')) return 'aws'
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/') || id.includes('scheduler')) return 'react'
          return undefined
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})

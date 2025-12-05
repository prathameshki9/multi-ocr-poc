/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'html', 'clover'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/stories/**'
      ],
      include: ['src/**/*.{ts,tsx}'],
      all: true,
      clean: true,
      reportOnFailure: true
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
}) 
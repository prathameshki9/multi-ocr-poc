import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import mockDevServerPlugin from 'vite-plugin-mock-dev-server'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    mode !== 'production' && mockDevServerPlugin({
      prefix: '/api',
      reload: true,
      cors: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
}))

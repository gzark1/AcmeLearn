import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    host: true, // Listen on all interfaces (needed for Docker)
    port: 5173,
    watch: {
      usePolling: true, // Enable polling for Docker on macOS/Windows
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://<user>.github.io/card-perks/ in production
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/card-perks/' : '/',
}))

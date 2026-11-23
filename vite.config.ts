import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths: the app works from any sub-path (e.g. GitHub Pages /tombola/).
  base: './',
  plugins: [react(), tailwindcss()],
})

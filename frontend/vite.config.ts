import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use '/' by default for Render/Vercel, and '/smart-quiz-generator' only for GitHub Pages
  base: process.env.NODE_ENV === 'production' && !process.env.RENDER ? "/smart-quiz-generator" : "/",
})

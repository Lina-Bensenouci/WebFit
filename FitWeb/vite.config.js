import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "", // Ajouter le nom du dépôt GitHub si on publie sur GH Pages : "/exemple/"
  server: {
    headers: {
      // Cette ligne permet d'autoriser les popups et les messages cross-origin
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      "Cross-Origin-Resource-Policy": "cross-origin"
    },
  },
})
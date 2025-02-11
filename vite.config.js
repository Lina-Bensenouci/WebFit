import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "" // Ajouter le nom du dépôt GitHub si on publie su GH Pages : "/exemple/"
})

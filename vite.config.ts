import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Supabase API calls through Vite dev server
      // This solves "Failed to fetch" when the browser can't reach supabase.co directly
      '/rest/v1': {
        target: 'https://glmvftjwtrghfizwwkdb.supabase.co',
        changeOrigin: true,
        secure: true,
      },
      '/auth/v1': {
        target: 'https://glmvftjwtrghfizwwkdb.supabase.co',
        changeOrigin: true,
        secure: true,
      },
      '/storage/v1': {
        target: 'https://glmvftjwtrghfizwwkdb.supabase.co',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

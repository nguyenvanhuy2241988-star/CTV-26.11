import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' loads all env vars regardless of prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Prioritize real environment variables (Vercel) over .env file
  const apiKey = process.env.API_KEY || env.API_KEY;

  return {
    plugins: [react()],
    // Polyfill process.env.API_KEY explicitly
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env': {} // Prevent "process is not defined" crash in browser
    }
  }
})
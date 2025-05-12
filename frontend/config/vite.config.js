import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react()
    ],

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: mode === 'development',
      chunkSizeWarningLimit: 1000,
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'yup'],
            lenis: ['@studio-freight/lenis']
          }
        }
      }
    },

    server: {
      port: 5001,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false
        }
      },
      cors: true
    },

    // Add assetsInclude to handle JPEG files
    assetsInclude: ['**/*.JPEG', '**/*.jpg', '**/*.png', '**/*.webp', '**/*.svg', '**/*.gif']
  }
})

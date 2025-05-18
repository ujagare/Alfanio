import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression2'
import path from 'path'
import imageOptimizer from './vite.config.image.js'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Explicitly set base path
  plugins: [
    react({
      // Add fast refresh options for better development experience
      fastRefresh: true,
      // Optimize JSX transformation
      jsxRuntime: 'automatic',
      // Allow JSX in .js files
      include: '**/*.{jsx,js}',
    }),
    imageOptimizer,
    // Gzip compression
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 10240, // Only compress files larger than 10kb
      deleteOriginalAssets: false, // Keep original files
    }),
    // Brotli compression (better than gzip)
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 10240,
      deleteOriginalAssets: false, // Keep original files
      compressionOptions: {
        level: 11, // Maximum compression level
      },
    }),
  ],
  // Force all JavaScript files to be treated as ES modules
  build: {
    modulePreload: {
      polyfill: true,
    },
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2, // Run compression twice for better results
        ecma: 2020, // Use modern ECMAScript features
        toplevel: true, // Enable top level variable and function name mangling
        unsafe_arrows: true, // More aggressive optimizations for arrow functions
        unsafe_methods: true, // More aggressive optimizations for method calls
      },
      mangle: {
        safari10: true, // Safari 10 compatibility
      },
      format: {
        comments: false, // Remove comments
        ascii_only: true, // Use ASCII characters only
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['framer-motion', 'gsap'],
          ui: ['@headlessui/react', '@heroicons/react'],
          forms: ['react-hook-form', 'yup'],
          utils: ['axios'],
          icons: ['react-icons'],
          sentry: ['@sentry/react', '@sentry/tracing'],
          // Split large libraries into separate chunks
          swiper: ['swiper'],
          leaflet: ['leaflet'],
          // Split by feature
          motion: ['@studio-freight/lenis', 'locomotive-scroll'],
          analytics: ['posthog-js']
        },
        format: 'es', // Ensure ES module format
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          } else if (/woff|woff2|ttf|otf/i.test(extType)) {
            extType = 'fonts';
          } else if (/mp4|webm|ogg/i.test(extType)) {
            extType = 'video';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        }
      }
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // 4kb - inline smaller assets as base64
    reportCompressedSize: false, // Improve build speed
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit to 1000kb
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': '/src'
    }
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      },
      '/contact': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      },
      '/brochure': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000
    },
    https: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion']
  },

  preview: {
    port: 5001,
    host: true
  },
  // Ensure proper MIME types for all files
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.(js|jsx)$/,
    exclude: []
  },
  // Ensure proper content type headers
  headers: {
    '*.js': {
      'Content-Type': 'application/javascript'
    },
    '*.jsx': {
      'Content-Type': 'application/javascript'
    },
    '*.mjs': {
      'Content-Type': 'application/javascript'
    }
  }
})

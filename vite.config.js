import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import dotenv from 'dotenv'
import { splitVendorChunkPlugin } from 'vite'


// https://vitejs.dev/config/
export default defineConfig(({ _, mode }) => {
  dotenv.config({path: '.okta.env'})

  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  if (!env.ISSUER || !env.CLIENT_ID) {
    throw new Error(`Set ISSUER and CLIENT_ID in .okta.env`)
  }

  return {
    plugins: [
      react(),
      splitVendorChunkPlugin() // Split vendor code into separate chunks
    ].filter(Boolean),
    resolve: {
      alias: {
        'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
        '@': path.resolve(__dirname, 'src') // Add shortcut for imports
      }
    },
    define: {
      'ISSUER': JSON.stringify(env.ISSUER),
      'CLIENT_ID': JSON.stringify(env.CLIENT_ID),
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    build: {
      target: 'es2015', // Modern browsers support
      minify: 'terser', // Better minification
      terserOptions: {
        compress: {
          drop_console: isProd, // Remove console.logs in production
          drop_debugger: isProd
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'mui': ['@mui/material', '@mui/icons-material', '@mui/x-data-grid', '@mui/x-date-pickers'],
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'okta': ['@okta/okta-auth-js', '@okta/okta-react'],
            'data': ['@tanstack/react-query', 'axios']
          }
        }
      },
      chunkSizeWarningLimit: 1000, // Increase the warning limit
      sourcemap: !isProd, // Only generate sourcemaps in development
      cssCodeSplit: true, // Split CSS into chunks
    },
    test: {
      environment: 'jsdom',
      globals: true
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://laxcoresrv.buck.local:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }

})

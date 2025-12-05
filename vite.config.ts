import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    }),
    // Brotli compression (best compression, modern browsers)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, // Only compress files > 1KB
      deleteOriginFile: false,
      compressionOptions: {
        level: 11 // Maximum compression
      }
    }),
    // Gzip compression (fallback for older browsers)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
      compressionOptions: {
        level: 9 // Maximum compression
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // i18n
            if (id.includes('i18next')) {
              return 'i18n';
            }

            // React Hook Form
            if (id.includes('react-hook-form')) {
              return 'react-forms';
            }

            // MUI Icons - MUST come BEFORE mui-core to avoid being caught by @mui/material
            if (id.includes('@mui/icons-material') || id.includes('/icons-material/')) {
              return 'mui-icons';
            }

            // MUI and Emotion - keep together due to tight coupling
            if (id.includes('@mui/material') || id.includes('@emotion') || id.includes('@mui/system')) {
              return 'mui-core';
            }

            if (id.includes('@mui/x-date-pickers') || id.includes('dayjs')) {
              return 'mui-pickers';
            }

            // Core React - keep together to avoid module resolution issues
            // Check for /react/, /react-dom/ to avoid catching packages with 'react' in name
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) {
              return 'react-vendor';
            }

            // recharts - separate chunk for better caching
            if (id.includes('recharts')) {
              return 'recharts';
            }

            // HTTP
            if (id.includes('axios')) {
              return 'http';
            }

            // Vercel analytics - handled by lazy loading in App.tsx, no manual chunk needed
            // Removed explicit chunking to allow dynamic imports to work properly

            // Heavy document export libraries - these should be lazy loaded
            if (id.includes('xlsx')) {
              return 'xlsx-vendor';
            }
            if (id.includes('jspdf') || id.includes('autotable')) {
              return 'jspdf-vendor';
            }
            if (id.includes('docx')) {
              return 'docx-vendor';
            }
            if (id.includes('html2canvas')) {
              return 'html2canvas-vendor';
            }

            // Other vendors
            return 'vendor';
          }
        },
        // Optimize chunk loading
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false
      }
    },
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2,
        ecma: 2020
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    reportCompressedSize: false,
    sourcemap: false,
    // Target modern browsers for smaller output
    target: 'es2020',
    modulePreload: {
      polyfill: false
    }
  },
  css: {
    devSourcemap: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
    exclude: ['xlsx', 'jspdf', 'jspdf-autotable', 'docx', '@vercel/analytics', '@vercel/speed-insights']
  }
});

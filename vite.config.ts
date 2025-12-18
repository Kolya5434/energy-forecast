import path from 'path';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    react(),
    // Visualizer for bundle analysis (only generates stats.html)
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: false,
      brotliSize: false
    })
    // Note: Compression removed - Vercel handles brotli/gzip automatically
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
    // Use esbuild for minification (much faster than terser)
    minify: 'esbuild',
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

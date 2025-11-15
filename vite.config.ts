import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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

            // MUI and Emotion - must come before React check
            if (id.includes('@mui/material')) {
              return 'mui-material';
            }
            if (id.includes('@emotion')) {
              return 'emotion';
            }
            if (id.includes('@mui/icons-material')) {
              return 'mui-icons';
            }
            if (id.includes('@mui/x-date-pickers') || id.includes('dayjs')) {
              return 'mui-pickers';
            }
            if (id.includes('@mui/system') || id.includes('@mui/utils')) {
              return 'mui-material';
            }

            // Core React - keep together to avoid module resolution issues
            // Check for /react/, /react-dom/ to avoid catching packages with 'react' in name
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) {
              return 'react-vendor';
            }

            // Chart libraries
            if (id.includes('echarts')) {
              return 'echarts';
            }
            if (id.includes('recharts')) {
              return 'recharts';
            }

            // HTTP
            if (id.includes('axios')) {
              return 'http';
            }

            // Vercel analytics - separate chunk
            if (id.includes('@vercel/analytics') || id.includes('@vercel/speed-insights')) {
              return 'vercel-analytics';
            }

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
    exclude: ['xlsx', 'jspdf', 'jspdf-autotable', 'docx']
  }
});

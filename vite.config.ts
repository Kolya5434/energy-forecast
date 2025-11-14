import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          'react-vendor': [
            'react',
            'react-dom',
            'react-hook-form'
          ],
          // i18n
          'i18n': [
            'i18next',
            'react-i18next'
          ],
          // MUI Core
          'mui-core': [
            '@mui/material',
            '@emotion/react',
            '@emotion/styled'
          ],
          // MUI Icons & Date Pickers
          'mui-extras': [
            '@mui/icons-material',
            '@mui/x-date-pickers',
            'dayjs'
          ],
          // Charts
          'charts': [
            'echarts',
            'recharts'
          ],
          // HTTP client
          'http': [
            'axios'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    }
  },
  css: {
    devSourcemap: false
  }
});

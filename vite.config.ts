import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'
            }
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('redux-persist')) {
              return 'vendor-redux'
            }
            if (id.includes('react-router-dom')) {
              return 'vendor-router'
            }
            if (id.includes('antd')) {
              return 'vendor-antd'
            }
            if (id.includes('@ant-design/icons')) {
              return 'vendor-icons'
            }
            // Other vendor libraries
            return 'vendor-misc'
          }

          // Application chunks
          if (id.includes('src/store')) {
            return 'app-store'
          }
          if (id.includes('src/hooks')) {
            return 'app-hooks'
          }
          if (id.includes('src/components')) {
            return 'app-components'
          }
        },
      },
    },
    chunkSizeWarningLimit: 300,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'antd',
      '@ant-design/icons',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
    ],
  },
})
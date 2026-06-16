import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom)[\\/]/,
            },
            {
              name: 'vendor-map',
              test: /node_modules[\\/](leaflet|react-leaflet|@react-leaflet)[\\/]/,
            },
            {
              name: 'vendor-export',
              test: /node_modules[\\/](xlsx|jszip|@mapbox[\\/]shp-write|shpjs)[\\/]/,
            },
            {
              name: 'vendor-geo',
              test: /node_modules[\\/]@turf[\\/]/,
            },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@map': path.resolve(__dirname, './src/map'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@services': path.resolve(__dirname, './src/services'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@repositories': path.resolve(__dirname, './src/repositories'),
    },
  },
})

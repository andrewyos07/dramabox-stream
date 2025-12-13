import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/dramabox': {
        target: 'https://dramabox.sansekai.my.id',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          // Remove /api/dramabox prefix and keep the rest
          const newPath = path.replace(/^\/api\/dramabox/, '/api/dramabox');
          console.log('Proxy rewrite:', path, '->', newPath);
          return newPath;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            console.log('Proxy target URL:', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})

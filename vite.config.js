import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'https://api.domainkini.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: true,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('[Proxy] Request:', req.method, req.url)
              console.log('[Proxy] Target:', options.target + proxyReq.path)
              console.log(
                '[Proxy] Headers:',
                req.headers.authorization
                  ? 'Authorization: Bearer ' + req.headers.authorization.substring(0, 30) + '...'
                  : 'No Authorization header'
              )
            })
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('[Proxy] Response:', proxyRes.statusCode, 'for', req.url)
            })
          },
        },
      },
    },
  }
})

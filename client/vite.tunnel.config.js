import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// HTTP config for tunneling
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5176,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false
            }
        }
    }
})

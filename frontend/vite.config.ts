import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';


const __dirname = process.cwd();

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
});
function resolve(__dirname: string, arg1: string): string {
    return path.resolve(__dirname, arg1);
}


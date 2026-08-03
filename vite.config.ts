import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import deno from '@deno/vite-plugin';

export default defineConfig({
  plugins: [vue(), deno()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).toString()
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/game': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        ws: true
      }
    }
  }
});

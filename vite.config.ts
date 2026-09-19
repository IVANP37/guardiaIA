import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3003,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/ollama': {
          target: 'http://127.0.0.1:11434',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ollama/, ''),
        },
        '/api/chat': {
          target: 'http://127.0.0.1:11434',
          changeOrigin: true,
        },
        '/api/tags': {
          target: 'http://127.0.0.1:11434',
          changeOrigin: true,
        },
      },
    },
  };
});

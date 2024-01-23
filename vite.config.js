// vite.config.js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import Vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    laravel({
      input: [
        'resources/css/app.css',
        'resources/js/app.js',
        'resources/js/messages.js',
      ],
      refresh: true,
    }),
    Vue(),
  ],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      '@': '/xampp/htdocs/chat-app', // Update this path to the correct absolute path
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    brotliSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules\/(vue|@vue)/.test(id)) {
            return 'vue';
          }
        },
      },
    },
  },
});

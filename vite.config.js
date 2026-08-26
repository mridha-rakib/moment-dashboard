// import react from '@vitejs/plugin-react';
// import { createRequire } from 'module';
// import { fileURLToPath, URL } from 'node:url';
// import { defineConfig } from 'vite';

// const require = createRequire(import.meta.url);

// // https://vite.dev/config/
// export default defineConfig({
//   base: process.env.VITE_BASE_PATH || '/',
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@/components': fileURLToPath(new URL('./src/Components', import.meta.url)),
//       '@': fileURLToPath(new URL('./src', import.meta.url)),
//     },
//   },
// });                                                                                             

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@/components': fileURLToPath(new URL('./src/Components', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

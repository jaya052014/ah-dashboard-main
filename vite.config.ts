import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: false,
    // IMPORTANT: plain strings, not regex here
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'subclavian-mickie-flexuously.ngrok-free.dev', // current ngrok URL host
    ],
  },
});
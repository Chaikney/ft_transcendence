/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@services': path.resolve(__dirname, './src/services'),
      '@features': path.resolve(__dirname, './src/features'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
  server: {
    host: true, // 👈 Obliga a Vite a escuchar en la red de Docker
    allowedHosts: true, // Mantenemos tu configuración actual
    watch: {
      usePolling: true, // 👈 EL REMEDIO: Forzar a Vite a rastrear cambios en Windows/Docker
    },
  }
});
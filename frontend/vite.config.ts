import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true, // Esto te permite usar 'describe', 'it', 'expect' sin importar
    environment: 'jsdom', // Simula el navegador en el entorno de tests
    setupFiles: './src/test/setup.ts', // Donde irán las configuraciones extra
  },
});

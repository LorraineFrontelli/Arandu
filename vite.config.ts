import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const requested = env.BASE_PATH || '/';
  const base = requested === '/' ? '/' : `/${requested.replace(/^\/+|\/+$/g, '')}/`;
  return { plugins: [react()], base, server: { watch: { usePolling: true, interval: 350 } }, build: { outDir: 'dist', sourcemap: false } };
});

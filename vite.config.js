import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html',
        basic: './examples/basic-example.html',
        robot: './examples/cargo-robot-showcase.html',
        particles: './examples/particle-effects-demo.html',
        materials: './examples/material-gallery.html',
        animations: './examples/animation-playground.html'
      }
    }
  },
  optimizeDeps: {
    include: ['three']
  }
});

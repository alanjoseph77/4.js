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
        main: 'index.html',
        basic: 'examples/basic-example.html',
        cargo: 'examples/cargo-robot-showcase.html',
        particles: 'examples/particle-effects-demo.html',
        materials: 'examples/material-gallery.html',
        animations: 'examples/animation-playground.html'
      }
    }
  },
  optimizeDeps: {
    include: ['three']
  }
});

// CDN Build Configuration
export const cdnConfig = defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/4js.js'),
      name: 'FourJS',
      fileName: (format) => `4js.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['three'],
      output: {
        globals: {
          three: 'THREE'
        }
      }
    },
    outDir: 'dist'
  }
});

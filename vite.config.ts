/**
 * Vite Configuration for zPhotoZoom
 *
 * This configuration builds the library in multiple formats:
 * - ESM (ES Modules) for modern bundlers
 * - UMD (Universal Module Definition) for browsers and CDN
 * - CJS (CommonJS) for Node.js environments
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      // Entry point - includes both core and carousel
      entry: resolve(__dirname, 'src/index.ts'),

      // Library name (used in UMD build) - exposes both classes
      name: 'zPhotoZoomLib',

      // Output file names for different formats
      fileName: (format) => {
        switch (format) {
          case 'es':
            return 'zphotozoom.esm.js';
          case 'umd':
            return 'zphotozoom.umd.js';
          case 'cjs':
            return 'zphotozoom.cjs.js';
          case 'iife':
            return 'zphotozoom.js'; // Default standalone version
          default:
            return `zphotozoom.${format}.js`;
        }
      },

      // Build formats - added 'iife' for default standalone version
      formats: ['es', 'umd', 'cjs', 'iife']
    },

    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: [],

      output: {
        // Global variables for UMD build
        globals: {},

        // Source maps
        sourcemap: true,

        // Preserve module structure for tree-shaking
        preserveModules: false,

        // Export mode
        exports: 'named',

        // Banner comment in output files
        banner: `/**
 * zPhotoZoom v2.0.0
 * A modern TypeScript library for interactive image zoom
 *
 * @license MIT
 * @author AMGHAR Abdeslam
 * @repository https://github.com/AMGHAR-AS/zPhotoZoom
 */`
      }
    },

    // Minification
    minify: 'terser',

    terserOptions: {
      compress: {
        // Remove console.log in production
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.debug']
      },
      format: {
        // Preserve license comments
        comments: /^!/
      }
    },

    // Output directory
    outDir: 'dist',

    // Empty output directory before build
    emptyOutDir: true,

    // Target environment
    target: 'es2020',

    // CSS handling
    cssCodeSplit: false,

    // Assets
    assetsDir: 'assets',

    // Build optimizations
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true,
    cors: true
  },

  // Preview server configuration
  preview: {
    port: 4173,
    open: true
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  // TypeScript configuration
  esbuild: {
    target: 'es2020',
    legalComments: 'inline'
  }
});

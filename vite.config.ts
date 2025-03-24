
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      'de1a2121-ac1b-48af-b6bd-f70fda5830a0.lovableproject.com'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: [], // Removed tsconfig.node.json from the exclusions
    esbuildOptions: {
      // Fix for TypeScript configuration issues
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          importsNotUsedAsValues: 'remove',
          target: 'es2020',
          skipLibCheck: true,
          isolatedModules: true
        }
      }
    }
  }
}));

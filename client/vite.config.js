import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: '.',
  envDir: '..',
  // Use Vite's built-in esbuild JSX transform; this avoids a missing
  // @babel/core peer dependency from @vitejs/plugin-react.
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'node',
  },
});

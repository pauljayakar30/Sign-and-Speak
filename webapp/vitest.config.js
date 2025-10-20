import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for browser-like environment
    environment: 'jsdom',
    
    // Enable globals (describe, it, expect, etc.) without imports
    globals: true,
    
    // Setup file to run before each test file
    setupFiles: './src/setupTests.js',
    
    // Test file patterns
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.js',
        '**/*.config.{js,ts}',
        '**/dist/**',
      ],
    },
    
    // Mock CSS modules
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
})

/**
 * Test Setup for zPhotoZoom
 *
 * This file is run before all tests to set up the testing environment
 */

import { afterEach, expect, vi } from 'vitest';

/**
 * Global test configuration
 */

// Mock Image loading for tests
global.Image = class Image {
  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 100);
  }

  src = '';
  width = 800;
  height = 600;
  onload: (() => void) | null = null;
} as any;

/**
 * Clean up after each test
 */
afterEach(() => {
  // Clear DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';

  // Clear any timers
  vi.clearAllTimers();
});

/**
 * Mock window dimensions
 */
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768
});

/**
 * Mock performance API if not available
 */
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now()
  } as any;
}

/**
 * Suppress console warnings in tests
 * Uncomment if needed
 */
// global.console = {
//   ...console,
//   warn: vi.fn(),
//   error: vi.fn(),
// };

/**
 * Custom matchers (if needed in the future)
 */
expect.extend({
  // Add custom matchers here
});

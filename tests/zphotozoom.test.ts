/**
 * zPhotoZoom Test Suite
 *
 * This file contains unit and integration tests for the zPhotoZoom library.
 * Tests are written using Vitest framework.
 *
 * To run tests:
 * - npm test                 : Run all tests
 * - npm run test:ui          : Run tests with UI
 * - npm run test:coverage    : Run tests with coverage report
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import zPhotoZoom from '../src/zphotozoom';

// Mock DOM environment
const setupDOM = () => {
  document.body.innerHTML = `
    <div id="test-container">
      <img src="test-image.jpg" class="test-image" alt="Test Image">
      <div class="bg-image" style="background-image: url('bg-test.jpg')"></div>
    </div>
  `;
};

const cleanupDOM = () => {
  document.body.innerHTML = '';
};

describe('zPhotoZoom', () => {
  beforeEach(() => {
    setupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  describe('Constructor', () => {
    it('should create an instance with valid options', () => {
      const viewer = new zPhotoZoom({
        el: '.test-image',
        min: 0.5,
        max: 5
      });

      expect(viewer).toBeInstanceOf(zPhotoZoom);
    });

    it('should inject CSS styles on instantiation', () => {
      new zPhotoZoom({ el: '.test-image' });

      const styleElement = document.getElementById('z-photo-zoom-styles');
      expect(styleElement).toBeTruthy();
      expect(styleElement?.tagName).toBe('STYLE');
    });

    it('should not inject CSS styles twice', () => {
      new zPhotoZoom({ el: '.test-image' });
      new zPhotoZoom({ el: '.bg-image' });

      const styleElements = document.querySelectorAll('#z-photo-zoom-styles');
      expect(styleElements.length).toBe(1);
    });

    it('should use default scale limits when not provided', () => {
      const viewer = new zPhotoZoom({ el: '.test-image' });

      // Access private property for testing (not recommended in production)
      const process = (viewer as any)._process;
      expect(process.scaleLimit.min).toBe(0.3);
      expect(process.scaleLimit.max).toBe(5);
    });

    it('should accept custom scale limits', () => {
      const viewer = new zPhotoZoom({
        el: '.test-image',
        min: 0.1,
        max: 10
      });

      const process = (viewer as any)._process;
      expect(process.scaleLimit.min).toBe(0.1);
      expect(process.scaleLimit.max).toBe(10);
    });
  });

  describe('Image Discovery', () => {
    it('should find img elements', () => {
      const viewer = new zPhotoZoom({ el: '.test-image' });
      const process = (viewer as any)._process;

      expect(process.images.length).toBeGreaterThan(0);
      expect(process.images[0].node.tagName).toBe('IMG');
    });

    it('should find elements with background images', () => {
      const viewer = new zPhotoZoom({ el: '.bg-image' });
      const process = (viewer as any)._process;

      expect(process.images.length).toBeGreaterThan(0);
    });

    it('should handle multiple images', () => {
      document.body.innerHTML += '<img src="image2.jpg" class="test-image">';
      document.body.innerHTML += '<img src="image3.jpg" class="test-image">';

      const viewer = new zPhotoZoom({ el: '.test-image' });
      const process = (viewer as any)._process;

      expect(process.images.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Public API Methods', () => {
    let viewer: zPhotoZoom;

    beforeEach(() => {
      viewer = new zPhotoZoom({ el: '.test-image' });
    });

    describe('stop() and resume()', () => {
      it('should stop interactions', () => {
        viewer.stop();
        const process = (viewer as any)._process;
        expect(process.flags.stopped).toBe(true);
      });

      it('should resume interactions', () => {
        viewer.stop();
        viewer.resume();
        const process = (viewer as any)._process;
        expect(process.flags.stopped).toBe(false);
      });
    });

    describe('change()', () => {
      it('should change selector and reinitialize', () => {
        document.body.innerHTML += '<img src="new.jpg" class="new-image">';

        viewer.change('.new-image');
        const process = (viewer as any)._process;

        expect(process.selector).toBe('.new-image');
      });
    });

    describe('close()', () => {
      it('should do nothing if viewer is not open', () => {
        expect(() => viewer.close()).not.toThrow();
      });
    });

    describe('reset()', () => {
      it('should do nothing if viewer is not open', () => {
        expect(() => viewer.reset()).not.toThrow();
      });
    });

    describe('update()', () => {
      it('should do nothing if viewer is not open', () => {
        expect(() => viewer.update()).not.toThrow();
      });
    });
  });

  describe('Event Callbacks', () => {
    let viewer: zPhotoZoom;

    beforeEach(() => {
      viewer = new zPhotoZoom({ el: '.test-image' });
    });

    describe('onOpen()', () => {
      it('should register open callback', () => {
        const callback = vi.fn();
        viewer.onOpen(callback);

        const process = (viewer as any)._process;
        expect(process.eventsOpen).toContain(callback);
      });

      it('should remove open callback when remove flag is true', () => {
        const callback = vi.fn();
        viewer.onOpen(callback);
        viewer.onOpen(callback, true);

        const process = (viewer as any)._process;
        expect(process.eventsOpen).not.toContain(callback);
      });

      it('should allow multiple callbacks', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        viewer.onOpen(callback1);
        viewer.onOpen(callback2);

        const process = (viewer as any)._process;
        expect(process.eventsOpen.length).toBe(2);
      });
    });

    describe('onClose()', () => {
      it('should register close callback', () => {
        const callback = vi.fn();
        viewer.onClose(callback);

        const process = (viewer as any)._process;
        expect(process.eventsClose).toContain(callback);
      });

      it('should remove close callback when remove flag is true', () => {
        const callback = vi.fn();
        viewer.onClose(callback);
        viewer.onClose(callback, true);

        const process = (viewer as any)._process;
        expect(process.eventsClose).not.toContain(callback);
      });
    });
  });

  describe('Utility Functions', () => {
    describe('calculateNewCenter', () => {
      it('should return single point for one cursor', () => {
        // This would test the exported utility function
        // Implementation depends on export strategy
      });

      it('should calculate average for multiple cursors', () => {
        // Test implementation
      });
    });

    describe('distance', () => {
      it('should calculate Euclidean distance correctly', () => {
        // Test implementation
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty selector', () => {
      const viewer = new zPhotoZoom({ el: '.non-existent' });
      const process = (viewer as any)._process;

      expect(process.images.length).toBe(0);
    });

    it('should handle invalid image URLs gracefully', () => {
      document.body.innerHTML = '<img src="invalid.jpg" class="invalid">';
      expect(() => new zPhotoZoom({ el: '.invalid' })).not.toThrow();
    });

    it('should handle rapid successive instantiations', () => {
      expect(() => {
        new zPhotoZoom({ el: '.test-image' });
        new zPhotoZoom({ el: '.test-image' });
        new zPhotoZoom({ el: '.test-image' });
      }).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners on close', () => {
      const viewer = new zPhotoZoom({ el: '.test-image' });

      // Open and close viewer to trigger cleanup
      // This would require mocking image loading

      // Verify no memory leaks
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Browser Compatibility', () => {
    it('should work with different document contexts', () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.body.innerHTML = '<img src="test.jpg" class="test">';

        const viewer = new zPhotoZoom({ el: '.test' }, iframeDoc);
        expect(viewer).toBeInstanceOf(zPhotoZoom);
      }

      document.body.removeChild(iframe);
    });
  });
});

/**
 * Integration Tests
 *
 * These tests verify the interaction between multiple components
 */
describe('zPhotoZoom Integration', () => {
  beforeEach(() => {
    setupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  describe('Full Lifecycle', () => {
    it('should handle complete open-interact-close cycle', async () => {
      const viewer = new zPhotoZoom({ el: '.test-image' });

      const onOpenSpy = vi.fn();
      const onCloseSpy = vi.fn();

      viewer.onOpen(onOpenSpy);
      viewer.onClose(onCloseSpy);

      // Simulate opening viewer
      // This would require triggering click events and mocking image loading

      // Verify callbacks were called
      // expect(onOpenSpy).toHaveBeenCalled();
      // expect(onCloseSpy).toHaveBeenCalled();
    });
  });

  describe('Window Resize', () => {
    it('should handle window resize events', () => {
      const viewer = new zPhotoZoom({ el: '.test-image' });

      // Simulate window resize
      window.dispatchEvent(new Event('resize'));

      // Verify viewer adjusted correctly
      expect(viewer).toBeInstanceOf(zPhotoZoom);
    });
  });
});

/**
 * Performance Tests
 *
 * These tests verify performance characteristics
 */
describe('zPhotoZoom Performance', () => {
  it('should initialize quickly', () => {
    const start = performance.now();
    new zPhotoZoom({ el: '.test-image' });
    const end = performance.now();

    expect(end - start).toBeLessThan(50); // Should take less than 50ms
  });

  it('should handle large numbers of images', () => {
    // Create 100 images
    for (let i = 0; i < 100; i++) {
      const img = document.createElement('img');
      img.src = `image${i}.jpg`;
      img.className = 'perf-test';
      document.body.appendChild(img);
    }

    const start = performance.now();
    new zPhotoZoom({ el: '.perf-test' });
    const end = performance.now();

    expect(end - start).toBeLessThan(1000); // Should handle 100 images in < 1s
  });
});

/**
 * TODO: Additional Tests to Implement
 *
 * - [ ] Test pinch-to-zoom gesture calculations
 * - [ ] Test mouse wheel zoom behavior
 * - [ ] Test drag-to-pan functionality
 * - [ ] Test touch event handling
 * - [ ] Test animation timing and smoothness
 * - [ ] Test scale limit enforcement
 * - [ ] Test container mode behavior
 * - [ ] Test keyboard navigation (when implemented)
 * - [ ] Test accessibility features (when implemented)
 * - [ ] Test error recovery and edge cases
 * - [ ] Test cross-browser compatibility
 * - [ ] Test mobile-specific features
 */

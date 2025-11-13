/**
 * Swipe Detection Component for zPhotoZoom Carousel
 *
 * @module carousel/SwipeDetector
 * @license MIT
 */

import type { SwipeDetectorOptions, ISwipeDetector } from './CarouselTypes';

/**
 * Touch point interface
 */
interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

/**
 * SwipeDetector - Detects swipe gestures for mobile navigation
 *
 * @example
 * ```typescript
 * const swipeDetector = new SwipeDetector({
 *   element: viewerContainer,
 *   threshold: 50,
 *   onSwipeLeft: () => carousel.next(),
 *   onSwipeRight: () => carousel.previous(),
 *   isEnabled: () => currentScale === 1
 * });
 * ```
 */
export class SwipeDetector implements ISwipeDetector {
  private options: SwipeDetectorOptions;
  private element: HTMLElement;
  private startPoint: TouchPoint | null = null;
  private enabled: boolean = true;

  // Bound event handlers
  private boundTouchStart: ((e: TouchEvent) => void) | null = null;
  private boundTouchMove: ((e: TouchEvent) => void) | null = null;
  private boundTouchEnd: ((e: TouchEvent) => void) | null = null;

  constructor(options: SwipeDetectorOptions) {
    this.options = options;
    this.element = options.element;

    this.enable();
  }

  /**
   * Enable swipe detection
   */
  public enable(): void {
    if (this.boundTouchStart) {
      return; // Already enabled
    }

    this.enabled = true;

    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);

    this.element.addEventListener('touchstart', this.boundTouchStart, { passive: true });
    this.element.addEventListener('touchmove', this.boundTouchMove, { passive: true });
    this.element.addEventListener('touchend', this.boundTouchEnd, { passive: true });
  }

  /**
   * Disable swipe detection
   */
  public disable(): void {
    if (!this.boundTouchStart) {
      return; // Already disabled
    }

    this.enabled = false;

    this.element.removeEventListener('touchstart', this.boundTouchStart as EventListener);
    this.element.removeEventListener('touchmove', this.boundTouchMove as EventListener);
    this.element.removeEventListener('touchend', this.boundTouchEnd as EventListener);

    this.boundTouchStart = null;
    this.boundTouchMove = null;
    this.boundTouchEnd = null;
  }

  /**
   * Destroy swipe detector (cleanup)
   */
  public destroy(): void {
    this.disable();
  }

  /**
   * Handle touch start
   */
  private handleTouchStart(e: TouchEvent): void {
    if (!this.enabled || !this.options.isEnabled()) {
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (touch) {
        this.startPoint = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
      }
    } else {
      // Multiple touches - cancel swipe
      this.startPoint = null;
    }
  }

  /**
   * Handle touch move
   */
  private handleTouchMove(e: TouchEvent): void {
    if (!this.enabled || !this.startPoint || !this.options.isEnabled()) {
      return;
    }

    // If more than one touch, cancel swipe
    if (e.touches.length > 1) {
      this.startPoint = null;
    }
  }

  /**
   * Handle touch end
   */
  private handleTouchEnd(e: TouchEvent): void {
    if (!this.enabled || !this.startPoint || !this.options.isEnabled()) {
      this.startPoint = null;
      return;
    }

    const touch = e.changedTouches[0];
    if (!touch) {
      this.startPoint = null;
      return;
    }

    const endPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    this.detectSwipe(this.startPoint, endPoint);
    this.startPoint = null;
  }

  /**
   * Detect and process swipe gesture
   */
  private detectSwipe(start: TouchPoint, end: TouchPoint): void {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const deltaTime = end.time - start.time;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if it's a horizontal swipe
    if (absDeltaX <= absDeltaY) {
      return; // Vertical swipe or not enough movement
    }

    // Check if it meets the threshold
    if (absDeltaX < this.options.threshold) {
      return; // Not enough distance
    }

    // Check if it's fast enough (max 300ms for a swipe)
    if (deltaTime > 300) {
      return; // Too slow
    }

    // Determine direction and trigger callback
    if (deltaX > 0) {
      // Swipe right -> previous image
      this.options.onSwipeRight();
    } else {
      // Swipe left -> next image
      this.options.onSwipeLeft();
    }
  }
}

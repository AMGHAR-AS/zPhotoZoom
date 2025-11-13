/**
 * Swipe Detection Component for zPhotoZoom Carousel
 *
 * @module carousel/SwipeDetector
 * @license MIT
 */
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
export class SwipeDetector {
    constructor(options) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "element", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "startPoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "enabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        // Bound event handlers
        Object.defineProperty(this, "boundTouchStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "boundTouchMove", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "boundTouchEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.options = options;
        this.element = options.element;
        this.enable();
    }
    /**
     * Enable swipe detection
     */
    enable() {
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
    disable() {
        if (!this.boundTouchStart) {
            return; // Already disabled
        }
        this.enabled = false;
        this.element.removeEventListener('touchstart', this.boundTouchStart);
        this.element.removeEventListener('touchmove', this.boundTouchMove);
        this.element.removeEventListener('touchend', this.boundTouchEnd);
        this.boundTouchStart = null;
        this.boundTouchMove = null;
        this.boundTouchEnd = null;
    }
    /**
     * Destroy swipe detector (cleanup)
     */
    destroy() {
        this.disable();
    }
    /**
     * Handle touch start
     */
    handleTouchStart(e) {
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
        }
        else {
            // Multiple touches - cancel swipe
            this.startPoint = null;
        }
    }
    /**
     * Handle touch move
     */
    handleTouchMove(e) {
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
    handleTouchEnd(e) {
        if (!this.enabled || !this.startPoint || !this.options.isEnabled()) {
            this.startPoint = null;
            return;
        }
        const touch = e.changedTouches[0];
        if (!touch) {
            this.startPoint = null;
            return;
        }
        const endPoint = {
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
    detectSwipe(start, end) {
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
        }
        else {
            // Swipe left -> next image
            this.options.onSwipeLeft();
        }
    }
}
//# sourceMappingURL=SwipeDetector.js.map
/**
 * Swipe Detection Component for zPhotoZoom Carousel
 *
 * @module carousel/SwipeDetector
 * @license MIT
 */
import type { SwipeDetectorOptions, ISwipeDetector } from './CarouselTypes';
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
export declare class SwipeDetector implements ISwipeDetector {
    private options;
    private element;
    private startPoint;
    private enabled;
    private boundTouchStart;
    private boundTouchMove;
    private boundTouchEnd;
    constructor(options: SwipeDetectorOptions);
    /**
     * Enable swipe detection
     */
    enable(): void;
    /**
     * Disable swipe detection
     */
    disable(): void;
    /**
     * Destroy swipe detector (cleanup)
     */
    destroy(): void;
    /**
     * Handle touch start
     */
    private handleTouchStart;
    /**
     * Handle touch move
     */
    private handleTouchMove;
    /**
     * Handle touch end
     */
    private handleTouchEnd;
    /**
     * Detect and process swipe gesture
     */
    private detectSwipe;
}
//# sourceMappingURL=SwipeDetector.d.ts.map
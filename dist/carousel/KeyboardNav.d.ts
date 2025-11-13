/**
 * Keyboard Navigation Component for zPhotoZoom Carousel
 *
 * @module carousel/KeyboardNav
 * @license MIT
 */
import type { KeyboardNavOptions, IKeyboardNav } from './CarouselTypes';
/**
 * KeyboardNav - Manages keyboard shortcuts for carousel navigation
 *
 * @example
 * ```typescript
 * const keyboardNav = new KeyboardNav({
 *   onNext: () => carousel.next(),
 *   onPrevious: () => carousel.previous(),
 *   onClose: () => carousel.close(),
 *   onFirst: () => carousel.first(),
 *   onLast: () => carousel.last(),
 *   enabled: true
 * });
 * ```
 */
export declare class KeyboardNav implements IKeyboardNav {
    private options;
    private enabled;
    private boundHandler;
    constructor(options: KeyboardNavOptions);
    /**
     * Enable keyboard navigation
     */
    enable(): void;
    /**
     * Disable keyboard navigation
     */
    disable(): void;
    /**
     * Destroy the keyboard navigation (cleanup)
     */
    destroy(): void;
    /**
     * Handle keyboard events
     */
    private handleKeyDown;
}
//# sourceMappingURL=KeyboardNav.d.ts.map
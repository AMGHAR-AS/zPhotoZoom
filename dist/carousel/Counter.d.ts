/**
 * Counter Component for zPhotoZoom Carousel
 *
 * @module carousel/Counter
 * @license MIT
 */
import type { ICounter } from './CarouselTypes';
/**
 * Counter - Displays current image number and total count
 *
 * @example
 * ```typescript
 * const counter = new Counter('top-right');
 * const counterElement = counter.render();
 * container.appendChild(counterElement);
 * counter.update(3, 12); // Shows "3 / 12"
 * ```
 */
export declare class Counter implements ICounter {
    private position;
    private container;
    private currentSpan;
    private totalSpan;
    constructor(position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right');
    /**
     * Render the counter
     */
    render(): HTMLElement;
    /**
     * Update the counter display
     */
    update(current: number, total: number): void;
    /**
     * Destroy the counter
     */
    destroy(): void;
}
//# sourceMappingURL=Counter.d.ts.map
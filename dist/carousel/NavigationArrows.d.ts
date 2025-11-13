/**
 * Navigation Arrows Component for zPhotoZoom Carousel
 *
 * @module carousel/NavigationArrows
 * @license MIT
 */
import type { INavigationArrows } from './CarouselTypes';
/**
 * NavigationArrows - Prev/Next arrow buttons for carousel
 *
 * @example
 * ```typescript
 * const arrows = new NavigationArrows(
 *   () => carousel.previous(),
 *   () => carousel.next(),
 *   'center'
 * );
 *
 * const arrowsElement = arrows.render();
 * container.appendChild(arrowsElement);
 * ```
 */
export declare class NavigationArrows implements INavigationArrows {
    private onPrevious;
    private onNext;
    private position;
    private container;
    private prevButton;
    private nextButton;
    constructor(onPrevious: () => void, onNext: () => void, position?: 'center' | 'bottom');
    /**
     * Render the navigation arrows
     */
    render(): HTMLElement;
    /**
     * Create an arrow button
     */
    private createArrowButton;
    /**
     * Create arrow SVG icon
     */
    private createArrowIcon;
    /**
     * Update disabled state based on current position
     */
    updateDisabledState(currentIndex: number, totalImages: number, loop: boolean): void;
    /**
     * Destroy the navigation arrows
     */
    destroy(): void;
}
//# sourceMappingURL=NavigationArrows.d.ts.map
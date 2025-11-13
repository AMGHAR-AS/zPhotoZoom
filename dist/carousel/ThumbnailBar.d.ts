/**
 * Thumbnail Bar Component for zPhotoZoom Carousel
 *
 * @module carousel/ThumbnailBar
 * @license MIT
 */
import type { ThumbnailBarOptions, IThumbnailBar, ImageDataExtended } from './CarouselTypes';
/**
 * ThumbnailBar - Displays a scrollable bar of image thumbnails
 *
 * @example
 * ```typescript
 * const thumbnailBar = new ThumbnailBar({
 *   images: imageArray,
 *   position: 'bottom',
 *   height: 120,
 *   visibleCount: 5,
 *   currentIndex: 0,
 *   onThumbnailClick: (index) => carousel.goTo(index)
 * });
 *
 * const barElement = thumbnailBar.render();
 * container.appendChild(barElement);
 * ```
 */
export declare class ThumbnailBar implements IThumbnailBar {
    private options;
    private container;
    private track;
    private thumbnails;
    private currentIndex;
    constructor(options: ThumbnailBarOptions);
    /**
     * Render the thumbnail bar
     */
    render(): HTMLElement;
    /**
     * Create a single thumbnail element
     */
    private createThumbnail;
    /**
     * Set the active thumbnail
     */
    setActive(index: number): void;
    /**
     * Scroll to the active thumbnail
     */
    scrollToActive(): void;
    /**
     * Scroll horizontally to center active thumbnail
     */
    private scrollHorizontal;
    /**
     * Scroll vertically to center active thumbnail
     */
    private scrollVertical;
    /**
     * Update the thumbnail bar with new images
     */
    update(images: ImageDataExtended[]): void;
    /**
     * Destroy the thumbnail bar
     */
    destroy(): void;
}
//# sourceMappingURL=ThumbnailBar.d.ts.map
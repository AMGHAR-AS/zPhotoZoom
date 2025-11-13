/**
 * Image Preloader Component for zPhotoZoom Carousel
 *
 * @module carousel/Preloader
 * @license MIT
 */
import type { PreloaderOptions, IPreloader } from './CarouselTypes';
/**
 * Preloader - Manages intelligent image preloading for smooth navigation
 *
 * @example
 * ```typescript
 * const preloader = new Preloader({
 *   images: imageArray,
 *   preloadAdjacent: true,
 *   preloadAll: false
 * });
 *
 * await preloader.preloadAdjacent(currentIndex);
 * ```
 */
export declare class Preloader implements IPreloader {
    private options;
    private images;
    private loadingQueue;
    private loadedIndices;
    constructor(options: PreloaderOptions);
    /**
     * Preload a specific image by index
     */
    preloadImage(index: number): Promise<void>;
    /**
     * Preload adjacent images (previous and next)
     */
    preloadAdjacent(currentIndex: number): Promise<void>;
    /**
     * Preload all images in the collection
     */
    preloadAll(): Promise<void>;
    /**
     * Wait for an image that's currently loading
     */
    private waitForLoad;
    /**
     * Get loading statistics
     */
    getStats(): {
        loaded: number;
        total: number;
        percentage: number;
    };
}
//# sourceMappingURL=Preloader.d.ts.map
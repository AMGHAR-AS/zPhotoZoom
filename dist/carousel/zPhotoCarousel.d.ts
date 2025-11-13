/**
 * zPhotoCarousel - Carousel Extension for zPhotoZoom
 *
 * @module carousel/zPhotoCarousel
 * @license MIT
 * @author AMGHAR Abdeslam
 */
import zPhotoZoom from '../zphotozoom';
import type { CarouselOptions, ImageDataExtended, NavigateEventCallback, SlideChangeEventCallback } from './CarouselTypes';
/**
 * zPhotoCarousel - Image carousel with zoom functionality
 *
 * @example
 * ```typescript
 * const carousel = new zPhotoCarousel({
 *   el: '.gallery img',
 *   carousel: true,
 *   enableThumbnails: true,
 *   enableKeyboard: true,
 *   transition: 'slide'
 * });
 *
 * carousel.onNavigate((event) => {
 *   console.log('Navigated to index:', event.to);
 * });
 * ```
 */
export declare class zPhotoCarousel extends zPhotoZoom {
    private _carouselState;
    private _carouselOptions;
    private _thumbnailBar?;
    private _keyboardNav?;
    private _preloader?;
    private _swipeDetector?;
    private _navigationArrows?;
    private _counter?;
    private _navigateCallbacks;
    private _slideChangeCallbacks;
    private _mainImageContainer?;
    constructor(options: CarouselOptions, context?: Document);
    /**
     * Initialize carousel components
     */
    private initializeCarousel;
    /**
     * Open carousel at specific index
     */
    private openCarouselAt;
    /**
     * Open viewer in carousel mode (override)
     */
    private openCarouselViewer;
    /**
     * Create carousel DOM structure
     */
    private createCarouselStructure;
    /**
     * Setup carousel UI components
     */
    private setupCarouselComponents;
    /**
     * Display image at index
     */
    private displayImage;
    /**
     * Update current image reference
     */
    private updateCurrentImage;
    /**
     * Navigate to next image
     */
    next(): void;
    /**
     * Navigate to previous image
     */
    previous(): void;
    /**
     * Go to specific index
     */
    goTo(index: number): void;
    /**
     * Go to first image
     */
    first(): void;
    /**
     * Go to last image
     */
    last(): void;
    /**
     * Navigate to index with direction
     */
    private navigateTo;
    /**
     * Update UI components after navigation
     */
    private updateUIComponents;
    /**
     * Get next index (with loop support)
     */
    private getNextIndex;
    /**
     * Get previous index (with loop support)
     */
    private getPreviousIndex;
    /**
     * Start slideshow
     */
    play(): void;
    /**
     * Pause slideshow
     */
    pause(): void;
    /**
     * Toggle slideshow play/pause
     */
    togglePlay(): void;
    /**
     * Get current image index
     */
    getCurrentIndex(): number;
    /**
     * Get total number of images
     */
    getTotalImages(): number;
    /**
     * Get all images
     */
    getImages(): ImageDataExtended[];
    /**
     * Check if slideshow is playing
     */
    isPlaying(): boolean;
    /**
     * Register navigate event callback
     */
    onNavigate(callback: NavigateEventCallback, remove?: boolean): void;
    /**
     * Register slide change event callback
     */
    onSlideChange(callback: SlideChangeEventCallback, remove?: boolean): void;
    /**
     * Override close to cleanup carousel components
     */
    close(): void;
    /**
     * Get container preview with carousel support
     */
    private getContainerPreview;
}
export default zPhotoCarousel;
//# sourceMappingURL=zPhotoCarousel.d.ts.map
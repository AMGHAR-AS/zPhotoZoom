/**
 * TypeScript Type Definitions for zPhotoZoom Carousel Extension
 *
 * @module carousel/CarouselTypes
 * @license MIT
 */
import type { zPhotoZoomOptions } from '../zphotozoom';
/**
 * Carousel-specific options extending base zPhotoZoom options
 */
export interface CarouselOptions extends zPhotoZoomOptions {
    carousel?: boolean;
    loop?: boolean;
    startIndex?: number;
    enableThumbnails?: boolean;
    thumbnailHeight?: number;
    thumbnailPosition?: 'top' | 'bottom' | 'left' | 'right';
    thumbnailsVisible?: number;
    enableKeyboard?: boolean;
    enableArrows?: boolean;
    arrowPosition?: 'center' | 'bottom';
    enableSwipe?: boolean;
    transition?: 'slide' | 'fade' | 'none';
    transitionDuration?: number;
    autoPlay?: boolean;
    autoPlayInterval?: number;
    pauseOnHover?: boolean;
    preloadAdjacent?: boolean;
    preloadAll?: boolean;
    showCounter?: boolean;
    counterPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
/**
 * Internal state for carousel
 */
export interface CarouselState {
    currentIndex: number;
    totalImages: number;
    isPlaying: boolean;
    playTimer: number | null;
    isTransitioning: boolean;
    direction: 'forward' | 'backward' | null;
}
/**
 * Options for ThumbnailBar component
 */
export interface ThumbnailBarOptions {
    images: ImageDataExtended[];
    position: 'top' | 'bottom' | 'left' | 'right';
    height: number;
    visibleCount: number;
    currentIndex: number;
    onThumbnailClick: (index: number) => void;
}
/**
 * Options for KeyboardNav component
 */
export interface KeyboardNavOptions {
    onNext: () => void;
    onPrevious: () => void;
    onClose: () => void;
    onFirst: () => void;
    onLast: () => void;
    onTogglePlay?: () => void;
    enabled: boolean;
}
/**
 * Options for Preloader component
 */
export interface PreloaderOptions {
    images: ImageDataExtended[];
    preloadAdjacent: boolean;
    preloadAll: boolean;
}
/**
 * Options for SwipeDetector component
 */
export interface SwipeDetectorOptions {
    element: HTMLElement;
    threshold: number;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    isEnabled: () => boolean;
}
/**
 * Extended ImageData with carousel-specific properties
 */
export interface ImageDataExtended {
    node: HTMLElement;
    src: string;
    imageNode?: HTMLImageElement;
    loaded?: boolean;
    width?: number;
    height?: number;
    prop?: number;
    landscape?: boolean;
    thumbnailSrc?: string;
    index?: number;
}
/**
 * Event triggered when navigating between images
 */
export interface NavigateEvent {
    from: number;
    to: number;
    direction: 'forward' | 'backward';
    image: ImageDataExtended;
    instance: any;
    preventDefault: () => void;
    stopPropagation: () => void;
}
/**
 * Event triggered after slide change completes
 */
export interface SlideChangeEvent {
    index: number;
    image: ImageDataExtended;
    total: number;
    instance: any;
}
/**
 * Event callback for navigation
 */
export interface NavigateEventCallback {
    (event: NavigateEvent): void;
}
/**
 * Event callback for slide change
 */
export interface SlideChangeEventCallback {
    (event: SlideChangeEvent): void;
}
/**
 * Interface for navigation arrows component
 */
export interface INavigationArrows {
    render(): HTMLElement;
    updateDisabledState(currentIndex: number, totalImages: number, loop: boolean): void;
    destroy(): void;
}
/**
 * Interface for counter component
 */
export interface ICounter {
    render(): HTMLElement;
    update(current: number, total: number): void;
    destroy(): void;
}
/**
 * Interface for thumbnail bar component
 */
export interface IThumbnailBar {
    render(): HTMLElement;
    setActive(index: number): void;
    scrollToActive(): void;
    destroy(): void;
}
/**
 * Interface for keyboard navigation component
 */
export interface IKeyboardNav {
    enable(): void;
    disable(): void;
    destroy(): void;
}
/**
 * Interface for preloader component
 */
export interface IPreloader {
    preloadImage(index: number): Promise<void>;
    preloadAdjacent(currentIndex: number): Promise<void>;
    preloadAll(): Promise<void>;
}
/**
 * Interface for swipe detector component
 */
export interface ISwipeDetector {
    enable(): void;
    disable(): void;
    destroy(): void;
}
/**
 * Transition function signature
 */
export interface TransitionFunction {
    (fromElement: HTMLImageElement, toElement: HTMLImageElement, direction: 'forward' | 'backward', duration: number, container: HTMLElement): Promise<void>;
}
/**
 * Transition registry
 */
export interface TransitionRegistry {
    slide: TransitionFunction;
    fade: TransitionFunction;
    none: TransitionFunction;
}
/**
 * Default carousel options
 */
export declare const DEFAULT_CAROUSEL_OPTIONS: Partial<CarouselOptions>;
//# sourceMappingURL=CarouselTypes.d.ts.map
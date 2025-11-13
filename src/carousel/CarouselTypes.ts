/**
 * TypeScript Type Definitions for zPhotoZoom Carousel Extension
 *
 * @module carousel/CarouselTypes
 * @license MIT
 */

import type { zPhotoZoomOptions, ViewerEvent, ViewerEventCallback } from '../zphotozoom';

// ============================================================================
// Carousel Configuration Types
// ============================================================================

/**
 * Carousel-specific options extending base zPhotoZoom options
 */
export interface CarouselOptions extends zPhotoZoomOptions {
  // Carousel behavior
  carousel?: boolean;                  // Enable carousel mode
  loop?: boolean;                      // Enable circular navigation (default: true)
  startIndex?: number;                 // Starting image index (default: 0)

  // Thumbnails
  enableThumbnails?: boolean;          // Show thumbnail bar (default: true)
  thumbnailHeight?: number;            // Thumbnail bar height in px (default: 120)
  thumbnailPosition?: 'top' | 'bottom' | 'left' | 'right'; // Position (default: 'bottom')
  thumbnailsVisible?: number;          // Number of visible thumbnails (default: 5)

  // Navigation
  enableKeyboard?: boolean;            // Enable keyboard navigation (default: true)
  enableArrows?: boolean;              // Show prev/next arrows (default: true)
  arrowPosition?: 'center' | 'bottom'; // Arrow positioning (default: 'center')
  enableSwipe?: boolean;               // Enable touch swipe (default: true)

  // Transitions
  transition?: 'slide' | 'fade' | 'none'; // Transition type (default: 'slide')
  transitionDuration?: number;         // Transition duration in ms (default: 400)

  // Slideshow (optional feature)
  autoPlay?: boolean;                  // Auto-start slideshow (default: false)
  autoPlayInterval?: number;           // Interval between slides in ms (default: 3000)
  pauseOnHover?: boolean;              // Pause slideshow on hover (default: true)

  // Preloading
  preloadAdjacent?: boolean;           // Preload adjacent images (default: true)
  preloadAll?: boolean;                // Preload all images (default: false)

  // Counter
  showCounter?: boolean;               // Show image counter (default: true)
  counterPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; // Position (default: 'top-right')
}

// ============================================================================
// State Management Types
// ============================================================================

/**
 * Internal state for carousel
 */
export interface CarouselState {
  currentIndex: number;                // Currently displayed image index
  totalImages: number;                 // Total number of images
  isPlaying: boolean;                  // Slideshow playing state
  playTimer: number | null;            // Slideshow timer ID
  isTransitioning: boolean;            // Currently transitioning between images
  direction: 'forward' | 'backward' | null; // Last navigation direction
}

// ============================================================================
// Component Types
// ============================================================================

/**
 * Options for ThumbnailBar component
 */
export interface ThumbnailBarOptions {
  images: ImageDataExtended[];         // Array of image data
  position: 'top' | 'bottom' | 'left' | 'right';
  height: number;                      // Bar height in pixels
  visibleCount: number;                // Number of visible thumbnails
  currentIndex: number;                // Currently active index
  onThumbnailClick: (index: number) => void; // Click handler
}

/**
 * Options for KeyboardNav component
 */
export interface KeyboardNavOptions {
  onNext: () => void;                  // Navigate to next
  onPrevious: () => void;              // Navigate to previous
  onClose: () => void;                 // Close viewer
  onFirst: () => void;                 // Go to first image
  onLast: () => void;                  // Go to last image
  onTogglePlay?: () => void;           // Toggle slideshow (optional)
  enabled: boolean;                    // Initially enabled state
}

/**
 * Options for Preloader component
 */
export interface PreloaderOptions {
  images: ImageDataExtended[];         // Array of images to preload
  preloadAdjacent: boolean;            // Preload adjacent images
  preloadAll: boolean;                 // Preload all images
}

/**
 * Options for SwipeDetector component
 */
export interface SwipeDetectorOptions {
  element: HTMLElement;                // Element to attach swipe detection
  threshold: number;                   // Minimum distance for swipe (px)
  onSwipeLeft: () => void;             // Swipe left handler (next)
  onSwipeRight: () => void;            // Swipe right handler (previous)
  isEnabled: () => boolean;            // Check if swipe should be enabled
}

/**
 * Extended ImageData with carousel-specific properties
 */
export interface ImageDataExtended {
  node: HTMLElement;                   // Original DOM element
  src: string;                         // Image source URL
  imageNode?: HTMLImageElement;        // Loaded image element
  loaded?: boolean;                    // Loading state
  width?: number;                      // Natural width
  height?: number;                     // Natural height
  prop?: number;                       // Aspect ratio (width/height)
  landscape?: boolean;                 // Is landscape orientation
  thumbnailSrc?: string;               // Thumbnail source (optional)
  index?: number;                      // Index in collection
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Event triggered when navigating between images
 */
export interface NavigateEvent {
  from: number;                        // Previous index
  to: number;                          // New index
  direction: 'forward' | 'backward';   // Navigation direction
  image: ImageDataExtended;            // Target image data
  instance: any;                       // Carousel instance (avoiding circular ref)
  preventDefault: () => void;          // Prevent navigation
  stopPropagation: () => void;         // Stop event propagation
}

/**
 * Event triggered after slide change completes
 */
export interface SlideChangeEvent {
  index: number;                       // Current index
  image: ImageDataExtended;            // Current image data
  total: number;                       // Total images
  instance: any;                       // Carousel instance
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

// ============================================================================
// UI Component Interfaces
// ============================================================================

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

// ============================================================================
// Transition Types
// ============================================================================

/**
 * Transition function signature
 */
export interface TransitionFunction {
  (
    fromElement: HTMLImageElement,
    toElement: HTMLImageElement,
    direction: 'forward' | 'backward',
    duration: number,
    container: HTMLElement
  ): Promise<void>;
}

/**
 * Transition registry
 */
export interface TransitionRegistry {
  slide: TransitionFunction;
  fade: TransitionFunction;
  none: TransitionFunction;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default carousel options
 */
export const DEFAULT_CAROUSEL_OPTIONS: Partial<CarouselOptions> = {
  carousel: true,
  loop: true,
  startIndex: 0,

  enableThumbnails: true,
  thumbnailHeight: 120,
  thumbnailPosition: 'bottom',
  thumbnailsVisible: 5,

  enableKeyboard: true,
  enableArrows: true,
  arrowPosition: 'center',
  enableSwipe: true,

  transition: 'slide',
  transitionDuration: 400,

  autoPlay: false,
  autoPlayInterval: 3000,
  pauseOnHover: true,

  preloadAdjacent: true,
  preloadAll: false,

  showCounter: true,
  counterPosition: 'top-right'
};

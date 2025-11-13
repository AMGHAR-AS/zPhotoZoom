/**
 * zPhotoZoom Carousel Module
 *
 * Exports all carousel components and types
 *
 * @module carousel
 * @license MIT
 */

// Main carousel class
export { zPhotoCarousel, default as zPhotoCarouselDefault } from './zPhotoCarousel';

// Components (for advanced usage)
export { KeyboardNav } from './KeyboardNav';
export { Preloader } from './Preloader';
export { SwipeDetector } from './SwipeDetector';
export { ThumbnailBar } from './ThumbnailBar';
export { NavigationArrows } from './NavigationArrows';
export { Counter } from './Counter';

// Transitions
export { getTransition, transitions } from './Transitions';

// Types
export type {
  CarouselOptions,
  CarouselState,
  ThumbnailBarOptions,
  KeyboardNavOptions,
  PreloaderOptions,
  SwipeDetectorOptions,
  ImageDataExtended,
  NavigateEvent,
  SlideChangeEvent,
  NavigateEventCallback,
  SlideChangeEventCallback,
  INavigationArrows,
  ICounter,
  IThumbnailBar,
  IKeyboardNav,
  IPreloader,
  ISwipeDetector,
  TransitionFunction,
  TransitionRegistry
} from './CarouselTypes';

export { DEFAULT_CAROUSEL_OPTIONS } from './CarouselTypes';

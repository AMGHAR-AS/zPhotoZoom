/**
 * zPhotoZoom - Main Entry Point
 *
 * @description
 * Modern TypeScript library for interactive image zoom viewers with carousel support
 *
 * @version 2.1.0
 * @license MIT
 * @author AMGHAR Abdeslam
 */

// Core zPhotoZoom (base functionality)
export { default as zPhotoZoom } from './zphotozoom';
export type { zPhotoZoomOptions, ViewerEvent, ViewerEventCallback } from './zphotozoom';

// Carousel extension
export { zPhotoCarousel } from './carousel';
export type {
  CarouselOptions,
  NavigateEvent,
  SlideChangeEvent,
  NavigateEventCallback,
  SlideChangeEventCallback,
  ImageDataExtended
} from './carousel';

// Default export (core functionality)
export { default } from './zphotozoom';

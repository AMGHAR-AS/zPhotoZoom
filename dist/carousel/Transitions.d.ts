/**
 * Transition Animations for zPhotoZoom Carousel
 *
 * @module carousel/Transitions
 * @license MIT
 */
import type { TransitionFunction, TransitionRegistry } from './CarouselTypes';
/**
 * Slide transition - Images slide in/out horizontally
 */
export declare const slideTransition: TransitionFunction;
/**
 * Fade transition - Cross-fade between images
 */
export declare const fadeTransition: TransitionFunction;
/**
 * No transition - Instant swap
 */
export declare const noneTransition: TransitionFunction;
/**
 * Transition registry - Maps transition names to functions
 */
export declare const transitions: TransitionRegistry;
/**
 * Get transition function by name
 */
export declare function getTransition(name: 'slide' | 'fade' | 'none'): TransitionFunction;
//# sourceMappingURL=Transitions.d.ts.map
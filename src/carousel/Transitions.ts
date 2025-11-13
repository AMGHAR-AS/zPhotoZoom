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
export const slideTransition: TransitionFunction = async (
  fromElement: HTMLImageElement,
  toElement: HTMLImageElement,
  direction: 'forward' | 'backward',
  duration: number,
  container: HTMLElement
): Promise<void> => {
  return new Promise((resolve) => {
    // Calculate offsets based on direction
    const startOffset = direction === 'forward' ? '100%' : '-100%';
    const endOffset = direction === 'forward' ? '-100%' : '100%';

    // Position new image off-screen
    toElement.style.position = 'absolute';
    toElement.style.top = '0';
    toElement.style.left = '0';
    toElement.style.width = '100%';
    toElement.style.height = '100%';
    toElement.style.transform = `translateX(${startOffset})`;
    toElement.style.opacity = '1';

    // Add to DOM
    container.appendChild(toElement);

    // Force reflow to ensure initial position is applied
    toElement.offsetHeight;

    // Setup transitions
    const timing = 'cubic-bezier(0.4, 0, 0.2, 1)';
    fromElement.style.transition = `transform ${duration}ms ${timing}`;
    toElement.style.transition = `transform ${duration}ms ${timing}`;

    // Trigger animations
    fromElement.style.transform = `translateX(${endOffset})`;
    toElement.style.transform = 'translateX(0)';

    // Cleanup after transition
    setTimeout(() => {
      if (fromElement.parentNode === container) {
        container.removeChild(fromElement);
      }

      // Reset styles
      fromElement.style.transform = '';
      fromElement.style.transition = '';
      fromElement.style.position = '';

      toElement.style.transition = '';
      toElement.style.position = '';

      resolve();
    }, duration);
  });
};

/**
 * Fade transition - Cross-fade between images
 */
export const fadeTransition: TransitionFunction = async (
  fromElement: HTMLImageElement,
  toElement: HTMLImageElement,
  _direction: 'forward' | 'backward',
  duration: number,
  container: HTMLElement
): Promise<void> => {
  return new Promise((resolve) => {
    // Position new image on top (invisible)
    toElement.style.position = 'absolute';
    toElement.style.top = '0';
    toElement.style.left = '0';
    toElement.style.width = '100%';
    toElement.style.height = '100%';
    toElement.style.opacity = '0';

    // Add to DOM
    container.appendChild(toElement);

    // Force reflow
    toElement.offsetHeight;

    // Setup transitions
    fromElement.style.transition = `opacity ${duration}ms ease`;
    toElement.style.transition = `opacity ${duration}ms ease`;

    // Trigger cross-fade
    fromElement.style.opacity = '0';
    toElement.style.opacity = '1';

    // Cleanup after transition
    setTimeout(() => {
      if (fromElement.parentNode === container) {
        container.removeChild(fromElement);
      }

      // Reset styles
      fromElement.style.opacity = '';
      fromElement.style.transition = '';
      fromElement.style.position = '';

      toElement.style.transition = '';
      toElement.style.position = '';

      resolve();
    }, duration);
  });
};

/**
 * No transition - Instant swap
 */
export const noneTransition: TransitionFunction = async (
  fromElement: HTMLImageElement,
  toElement: HTMLImageElement,
  _direction: 'forward' | 'backward',
  _duration: number,
  container: HTMLElement
): Promise<void> => {
  return new Promise((resolve) => {
    // Add new image
    container.appendChild(toElement);

    // Remove old image
    if (fromElement.parentNode === container) {
      container.removeChild(fromElement);
    }

    resolve();
  });
};

/**
 * Transition registry - Maps transition names to functions
 */
export const transitions: TransitionRegistry = {
  slide: slideTransition,
  fade: fadeTransition,
  none: noneTransition
};

/**
 * Get transition function by name
 */
export function getTransition(name: 'slide' | 'fade' | 'none'): TransitionFunction {
  return transitions[name] || slideTransition;
}

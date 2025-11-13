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
  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!fromElement || !toElement || !container) {
      reject(new Error('Transition requires valid fromElement, toElement, and container'));
      return;
    }

    if (!container.contains(fromElement) && fromElement.parentNode) {
      console.warn('zPhotoCarousel: fromElement is not in the expected container');
    }

    try {
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

      // Add to DOM (handle if already in DOM)
      if (toElement.parentNode !== container) {
        container.appendChild(toElement);
      }

      // Force reflow to ensure initial position is applied
      void toElement.offsetHeight;

      // Setup transitions
      const timing = 'cubic-bezier(0.4, 0, 0.2, 1)';
      fromElement.style.transition = `transform ${duration}ms ${timing}`;
      toElement.style.transition = `transform ${duration}ms ${timing}`;

      // Trigger animations
      fromElement.style.transform = `translateX(${endOffset})`;
      toElement.style.transform = 'translateX(0)';

      // Cleanup after transition
      const timeoutId = setTimeout(() => {
        try {
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
        } catch (cleanupError) {
          console.error('zPhotoCarousel: Error during transition cleanup:', cleanupError);
          resolve(); // Resolve anyway to prevent hanging
        }
      }, duration);

      // Store timeout ID on element for potential cancellation
      (toElement as any).__transitionTimeoutId = timeoutId;

    } catch (error) {
      console.error('zPhotoCarousel: Error during slide transition:', error);
      reject(error);
    }
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
  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!fromElement || !toElement || !container) {
      reject(new Error('Transition requires valid fromElement, toElement, and container'));
      return;
    }

    if (!container.contains(fromElement) && fromElement.parentNode) {
      console.warn('zPhotoCarousel: fromElement is not in the expected container');
    }

    try {
      // Position new image on top (invisible)
      toElement.style.position = 'absolute';
      toElement.style.top = '0';
      toElement.style.left = '0';
      toElement.style.width = '100%';
      toElement.style.height = '100%';
      toElement.style.opacity = '0';

      // Add to DOM (handle if already in DOM)
      if (toElement.parentNode !== container) {
        container.appendChild(toElement);
      }

      // Force reflow
      void toElement.offsetHeight;

      // Setup transitions
      fromElement.style.transition = `opacity ${duration}ms ease`;
      toElement.style.transition = `opacity ${duration}ms ease`;

      // Trigger cross-fade
      fromElement.style.opacity = '0';
      toElement.style.opacity = '1';

      // Cleanup after transition
      const timeoutId = setTimeout(() => {
        try {
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
        } catch (cleanupError) {
          console.error('zPhotoCarousel: Error during transition cleanup:', cleanupError);
          resolve(); // Resolve anyway to prevent hanging
        }
      }, duration);

      // Store timeout ID on element for potential cancellation
      (toElement as any).__transitionTimeoutId = timeoutId;

    } catch (error) {
      console.error('zPhotoCarousel: Error during fade transition:', error);
      reject(error);
    }
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
  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!fromElement || !toElement || !container) {
      reject(new Error('Transition requires valid fromElement, toElement, and container'));
      return;
    }

    try {
      // Add new image (handle if already in DOM)
      if (toElement.parentNode !== container) {
        container.appendChild(toElement);
      }

      // Remove old image
      if (fromElement.parentNode === container) {
        container.removeChild(fromElement);
      }

      resolve();
    } catch (error) {
      console.error('zPhotoCarousel: Error during instant transition:', error);
      reject(error);
    }
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

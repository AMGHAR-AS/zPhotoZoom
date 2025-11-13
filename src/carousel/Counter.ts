/**
 * Counter Component for zPhotoZoom Carousel
 *
 * @module carousel/Counter
 * @license MIT
 */

import type { ICounter } from './CarouselTypes';

/**
 * Counter - Displays current image number and total count
 *
 * @example
 * ```typescript
 * const counter = new Counter('top-right');
 * const counterElement = counter.render();
 * container.appendChild(counterElement);
 * counter.update(3, 12); // Shows "3 / 12"
 * ```
 */
export class Counter implements ICounter {
  private container: HTMLElement | null = null;
  private currentSpan: HTMLSpanElement | null = null;
  private totalSpan: HTMLSpanElement | null = null;

  constructor(
    private position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'top-right'
  ) {}

  /**
   * Render the counter
   */
  public render(): HTMLElement {
    this.container = document.createElement('div');
    this.container.className = `zpz-counter zpz-counter-${this.position}`;
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'true');

    // Current number
    this.currentSpan = document.createElement('span');
    this.currentSpan.className = 'zpz-counter-current';
    this.currentSpan.textContent = '1';

    // Separator
    const separator = document.createElement('span');
    separator.className = 'zpz-counter-separator';
    separator.textContent = '/';

    // Total number
    this.totalSpan = document.createElement('span');
    this.totalSpan.className = 'zpz-counter-total';
    this.totalSpan.textContent = '1';

    this.container.appendChild(this.currentSpan);
    this.container.appendChild(separator);
    this.container.appendChild(this.totalSpan);

    return this.container;
  }

  /**
   * Update the counter display
   */
  public update(current: number, total: number): void {
    if (!this.currentSpan || !this.totalSpan) {
      return;
    }

    this.currentSpan.textContent = current.toString();
    this.totalSpan.textContent = total.toString();

    // Update aria-label for screen readers
    if (this.container) {
      this.container.setAttribute(
        'aria-label',
        `Image ${current} of ${total}`
      );
    }
  }

  /**
   * Destroy the counter
   */
  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.currentSpan = null;
    this.totalSpan = null;
  }
}

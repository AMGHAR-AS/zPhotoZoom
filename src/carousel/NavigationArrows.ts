/**
 * Navigation Arrows Component for zPhotoZoom Carousel
 *
 * @module carousel/NavigationArrows
 * @license MIT
 */

import type { INavigationArrows } from './CarouselTypes';

/**
 * NavigationArrows - Prev/Next arrow buttons for carousel
 *
 * @example
 * ```typescript
 * const arrows = new NavigationArrows(
 *   () => carousel.previous(),
 *   () => carousel.next(),
 *   'center'
 * );
 *
 * const arrowsElement = arrows.render();
 * container.appendChild(arrowsElement);
 * ```
 */
export class NavigationArrows implements INavigationArrows {
  private container: HTMLElement | null = null;
  private prevButton: HTMLButtonElement | null = null;
  private nextButton: HTMLButtonElement | null = null;

  constructor(
    private onPrevious: () => void,
    private onNext: () => void,
    private position: 'center' | 'bottom' = 'center'
  ) {}

  /**
   * Render the navigation arrows
   */
  public render(): HTMLElement {
    this.container = document.createElement('div');
    this.container.className = `zpz-nav-arrows zpz-arrows-${this.position}`;

    // Create previous button
    this.prevButton = this.createArrowButton('prev', this.onPrevious);
    this.container.appendChild(this.prevButton);

    // Create next button
    this.nextButton = this.createArrowButton('next', this.onNext);
    this.container.appendChild(this.nextButton);

    return this.container;
  }

  /**
   * Create an arrow button
   */
  private createArrowButton(
    direction: 'prev' | 'next',
    onClick: () => void
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = `zpz-arrow zpz-arrow-${direction}`;
    button.setAttribute('aria-label', direction === 'prev' ? 'Previous image' : 'Next image');
    button.type = 'button';

    // Add SVG icon
    const svg = this.createArrowIcon(direction);
    button.appendChild(svg);

    // Add click handler
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });

    return button;
  }

  /**
   * Create arrow SVG icon
   */
  private createArrowIcon(direction: 'prev' | 'next'): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '28');
    svg.setAttribute('height', '28');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    if (direction === 'prev') {
      // Modern left chevron with double lines for emphasis
      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path1.setAttribute('d', 'M15 18l-6-6 6-6');
      svg.appendChild(path1);

      const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path2.setAttribute('d', 'M19 18l-6-6 6-6');
      path2.setAttribute('opacity', '0.5');
      svg.appendChild(path2);
    } else {
      // Modern right chevron with double lines for emphasis
      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path1.setAttribute('d', 'M9 18l6-6-6-6');
      svg.appendChild(path1);

      const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path2.setAttribute('d', 'M5 18l6-6-6-6');
      path2.setAttribute('opacity', '0.5');
      svg.appendChild(path2);
    }

    return svg;
  }

  /**
   * Update disabled state based on current position
   */
  public updateDisabledState(
    currentIndex: number,
    totalImages: number,
    loop: boolean
  ): void {
    if (!this.prevButton || !this.nextButton) {
      return;
    }

    if (loop) {
      // Always enabled in loop mode
      this.prevButton.disabled = false;
      this.nextButton.disabled = false;
    } else {
      // Disable at boundaries
      this.prevButton.disabled = currentIndex === 0;
      this.nextButton.disabled = currentIndex === totalImages - 1;
    }
  }

  /**
   * Destroy the navigation arrows
   */
  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.prevButton = null;
    this.nextButton = null;
  }
}

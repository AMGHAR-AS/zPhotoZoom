/**
 * Thumbnail Bar Component for zPhotoZoom Carousel
 *
 * @module carousel/ThumbnailBar
 * @license MIT
 */

import type { ThumbnailBarOptions, IThumbnailBar, ImageDataExtended } from './CarouselTypes';

/**
 * ThumbnailBar - Displays a scrollable bar of image thumbnails
 *
 * @example
 * ```typescript
 * const thumbnailBar = new ThumbnailBar({
 *   images: imageArray,
 *   position: 'bottom',
 *   height: 120,
 *   visibleCount: 5,
 *   currentIndex: 0,
 *   onThumbnailClick: (index) => carousel.goTo(index)
 * });
 *
 * const barElement = thumbnailBar.render();
 * container.appendChild(barElement);
 * ```
 */
export class ThumbnailBar implements IThumbnailBar {
  private options: ThumbnailBarOptions;
  private container: HTMLElement | null = null;
  private track: HTMLElement | null = null;
  private thumbnails: HTMLElement[] = [];
  private currentIndex: number;

  constructor(options: ThumbnailBarOptions) {
    this.options = options;
    this.currentIndex = options.currentIndex;
  }

  /**
   * Render the thumbnail bar
   */
  public render(): HTMLElement {
    // Create container
    this.container = document.createElement('div');
    this.container.className = `zpz-thumbnail-bar zpz-tb-${this.options.position}`;
    this.container.style.height = `${this.options.height}px`;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'zpz-tb-container';
    this.container.appendChild(wrapper);

    // Create scrollable track
    this.track = document.createElement('div');
    this.track.className = 'zpz-tb-track';
    wrapper.appendChild(this.track);

    // Create thumbnails
    this.options.images.forEach((image, index) => {
      const thumbnailEl = this.createThumbnail(image, index);
      this.thumbnails.push(thumbnailEl);
      this.track!.appendChild(thumbnailEl);
    });

    // Set initial active state
    this.setActive(this.currentIndex);

    return this.container;
  }

  /**
   * Create a single thumbnail element
   */
  private createThumbnail(image: ImageDataExtended, index: number): HTMLElement {
    const item = document.createElement('div');
    item.className = 'zpz-tb-item';
    item.setAttribute('data-index', index.toString());
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `View image ${index + 1}`);

    // Set thumbnail to take full height (100%)
    const isHorizontal = this.options.position === 'top' || this.options.position === 'bottom';

    if (isHorizontal) {
      // For horizontal bars, thumbnails take full height and auto width based on aspect ratio
      item.style.height = '100%';
    } else {
      // For vertical bars, thumbnails take full width
      item.style.width = '100%';
    }

    // Create img element
    const img = document.createElement('img');
    img.src = image.thumbnailSrc || image.src;
    img.alt = `Thumbnail ${index + 1}`;
    img.draggable = false;
    img.style.pointerEvents = 'none';
    item.appendChild(img);

    // Add click handler
    item.addEventListener('click', () => {
      this.options.onThumbnailClick(index);
    });

    // Add keyboard handler
    item.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.options.onThumbnailClick(index);
      }
    });

    return item;
  }

  /**
   * Set the active thumbnail
   */
  public setActive(index: number): void {
    if (index < 0 || index >= this.thumbnails.length) {
      return;
    }

    // Remove active class from current
    if (this.currentIndex >= 0 && this.currentIndex < this.thumbnails.length) {
      const currentThumb = this.thumbnails[this.currentIndex];
      if (currentThumb) {
        currentThumb.classList.remove('zpz-tb-active');
        currentThumb.setAttribute('aria-selected', 'false');
      }
    }

    // Add active class to new
    const newThumb = this.thumbnails[index];
    if (newThumb) {
      newThumb.classList.add('zpz-tb-active');
      newThumb.setAttribute('aria-selected', 'true');
    }

    this.currentIndex = index;

    // Scroll to active
    this.scrollToActive();
  }

  /**
   * Scroll to the active thumbnail using native smooth scroll
   */
  public scrollToActive(): void {
    if (!this.track || !this.container || this.currentIndex < 0) {
      return;
    }

    const activeThumbnail = this.thumbnails[this.currentIndex];
    if (!activeThumbnail) {
      return;
    }

    // Use native smooth scroll to center the active thumbnail
    activeThumbnail.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }

  /**
   * Update the thumbnail bar with new images
   */
  public update(images: ImageDataExtended[]): void {
    if (!this.track) {
      return;
    }

    // Clear existing thumbnails
    this.track.innerHTML = '';
    this.thumbnails = [];

    // Create new thumbnails
    images.forEach((image, index) => {
      const thumbnailEl = this.createThumbnail(image, index);
      this.thumbnails.push(thumbnailEl);
      this.track!.appendChild(thumbnailEl);
    });

    // Reset active state
    this.setActive(0);
  }

  /**
   * Destroy the thumbnail bar
   */
  public destroy(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.track = null;
    this.thumbnails = [];
  }
}

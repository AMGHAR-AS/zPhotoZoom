/**
 * Image Preloader Component for zPhotoZoom Carousel
 *
 * @module carousel/Preloader
 * @license MIT
 */

import type { PreloaderOptions, IPreloader, ImageDataExtended } from './CarouselTypes';

/**
 * Preloader - Manages intelligent image preloading for smooth navigation
 *
 * @example
 * ```typescript
 * const preloader = new Preloader({
 *   images: imageArray,
 *   preloadAdjacent: true,
 *   preloadAll: false
 * });
 *
 * await preloader.preloadAdjacent(currentIndex);
 * ```
 */
export class Preloader implements IPreloader {
  private options: PreloaderOptions;
  private images: ImageDataExtended[];
  private loadingQueue: Set<number> = new Set();
  private loadedIndices: Set<number> = new Set();

  constructor(options: PreloaderOptions) {
    this.options = options;
    this.images = options.images || [];

    // Validate images array
    if (!Array.isArray(this.images)) {
      console.error('zPhotoCarousel: Preloader requires an array of images');
      this.images = [];
      return;
    }

    // If preloadAll is enabled, start preloading immediately
    if (this.options.preloadAll && this.images.length > 0) {
      this.preloadAll().catch(err => {
        console.warn('zPhotoCarousel: Error preloading all images:', err);
      });
    }
  }

  /**
   * Preload a specific image by index
   */
  public async preloadImage(index: number): Promise<void> {
    // Validate index
    if (index < 0 || index >= this.images.length) {
      return Promise.reject(new Error(`Invalid index: ${index}`));
    }

    const imageData = this.images[index];

    // Validate imageData exists
    if (!imageData) {
      return Promise.reject(new Error(`Image data not found at index: ${index}`));
    }

    // Already loaded
    if (imageData.loaded || this.loadedIndices.has(index)) {
      return Promise.resolve();
    }

    // Already in loading queue
    if (this.loadingQueue.has(index)) {
      // Wait for existing load to complete
      return this.waitForLoad(index);
    }

    // Add to loading queue
    this.loadingQueue.add(index);

    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        imageData.imageNode = img;
        imageData.loaded = true;
        imageData.width = img.naturalWidth;
        imageData.height = img.naturalHeight;
        imageData.prop = img.naturalWidth / img.naturalHeight;
        imageData.landscape = img.naturalWidth >= img.naturalHeight;

        this.loadedIndices.add(index);
        this.loadingQueue.delete(index);
        resolve();
      };

      img.onerror = () => {
        console.warn(`zPhotoCarousel: Failed to load image at index ${index}:`, imageData.src);

        // Mark as loaded but failed to prevent blocking navigation
        imageData.imageNode = img;  // Keep reference even if broken
        imageData.loaded = true;    // Mark as "loaded" to unblock
        (imageData as any).failed = true;  // Add failed flag for future handling

        this.loadedIndices.add(index);
        this.loadingQueue.delete(index);

        // Resolve instead of reject to allow navigation to continue
        resolve();
      };

      img.src = imageData.src;
    });
  }

  /**
   * Preload adjacent images (previous and next)
   */
  public async preloadAdjacent(currentIndex: number): Promise<void> {
    if (!this.options.preloadAdjacent) {
      return Promise.resolve();
    }

    const totalImages = this.images.length;

    // Validate index and images exist
    if (totalImages === 0 || currentIndex < 0 || currentIndex >= totalImages) {
      return Promise.resolve();
    }

    const toPreload: number[] = [];

    // Next image
    const nextIndex = (currentIndex + 1) % totalImages;
    const nextImage = this.images[nextIndex];
    if (nextImage && !nextImage.loaded && !this.loadedIndices.has(nextIndex)) {
      toPreload.push(nextIndex);
    }

    // Previous image
    const prevIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
    const prevImage = this.images[prevIndex];
    if (prevImage && !prevImage.loaded && !this.loadedIndices.has(prevIndex)) {
      toPreload.push(prevIndex);
    }

    // Preload in parallel
    try {
      await Promise.all(toPreload.map(index => this.preloadImage(index)));
    } catch (error) {
      // Continue even if some images fail to load
      console.warn('zPhotoCarousel: Some adjacent images failed to preload', error);
    }
  }

  /**
   * Preload all images in the collection
   */
  public async preloadAll(): Promise<void> {
    if (!this.options.preloadAll) {
      return Promise.resolve();
    }

    const toPreload: number[] = [];

    for (let i = 0; i < this.images.length; i++) {
      const img = this.images[i];
      if (img && !img.loaded && !this.loadedIndices.has(i)) {
        toPreload.push(i);
      }
    }

    // Preload in batches to avoid overwhelming the browser
    const batchSize = 3;
    for (let i = 0; i < toPreload.length; i += batchSize) {
      const batch = toPreload.slice(i, i + batchSize);
      try {
        await Promise.all(batch.map(index => this.preloadImage(index)));
      } catch (error) {
        console.warn('zPhotoCarousel: Some images failed to preload in batch', error);
      }
    }
  }

  /**
   * Wait for an image that's currently loading
   */
  private waitForLoad(index: number): Promise<void> {
    return new Promise((resolve) => {
      let timeoutHandle: ReturnType<typeof setTimeout>;

      const checkInterval = setInterval(() => {
        if (!this.loadingQueue.has(index)) {
          clearInterval(checkInterval);
          clearTimeout(timeoutHandle);
          resolve();
        }
      }, 50);

      // Timeout after 10 seconds
      timeoutHandle = setTimeout(() => {
        clearInterval(checkInterval);
        console.warn(`zPhotoCarousel: Preload timeout for image at index ${index}`);
        resolve();
      }, 10000);
    });
  }

  /**
   * Get loading statistics
   */
  public getStats(): { loaded: number; total: number; percentage: number } {
    const total = this.images.length;
    const loaded = this.loadedIndices.size;

    return {
      loaded,
      total,
      percentage: total > 0 ? Math.round((loaded / total) * 100) : 0
    };
  }
}

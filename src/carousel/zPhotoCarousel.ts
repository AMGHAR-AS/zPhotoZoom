/**
 * zPhotoCarousel - Carousel Extension for zPhotoZoom
 *
 * @module carousel/zPhotoCarousel
 * @license MIT
 * @author AMGHAR Abdeslam
 */

//@ts-nocheck
import zPhotoZoom from '../zphotozoom';
import type {
  CarouselOptions,
  CarouselState,
  ImageDataExtended,
  NavigateEvent,
  SlideChangeEvent,
  NavigateEventCallback,
  SlideChangeEventCallback,
  DEFAULT_CAROUSEL_OPTIONS
} from './CarouselTypes';

import { KeyboardNav } from './KeyboardNav';
import { Preloader } from './Preloader';
import { SwipeDetector } from './SwipeDetector';
import { ThumbnailBar } from './ThumbnailBar';
import { NavigationArrows } from './NavigationArrows';
import { Counter } from './Counter';
import { getTransition } from './Transitions';

/**
 * Inject carousel-specific CSS styles
 */
const injectCarouselStyles = (): void => {
  if (document.getElementById('z-photo-carousel-styles')) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'z-photo-carousel-styles';
  styleElement.textContent = `
    /* Carousel main container modifications */
    .ZPhotoZoom.zpz-carousel-mode {
      display: flex;
      flex-direction: column;
    }

    .zpz-main-image-container {
      position: relative;
      flex: 1;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .zpz-main-image-container img {
      position: absolute;
      max-width: 100%;
      max-height: 100%;
    }

    /* Navigation Arrows */
    .zpz-nav-arrows {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 999;
    }

    .zpz-arrow {
      pointer-events: auto;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.2);
      width: 50px;
      height: 50px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      outline: none;
    }

    .zpz-arrow:hover:not(:disabled) {
      background: rgba(102, 126, 234, 0.8);
      border-color: rgba(102, 126, 234, 1);
      transform: translateY(-50%) scale(1.1);
    }

    .zpz-arrow:active:not(:disabled) {
      transform: translateY(-50%) scale(0.95);
    }

    .zpz-arrow:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .zpz-arrow:focus-visible {
      outline: 2px solid #667eea;
      outline-offset: 2px;
    }

    .zpz-arrow-prev {
      left: 20px;
    }

    .zpz-arrow-next {
      right: 20px;
    }

    .zpz-arrow svg {
      width: 24px;
      height: 24px;
      fill: none;
    }

    /* Counter */
    .zpz-counter {
      position: absolute;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      padding: 8px 16px;
      border-radius: 20px;
      color: white;
      font-size: 16px;
      font-weight: 500;
      z-index: 1000;
      user-select: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .zpz-counter-top-left {
      top: 20px;
      left: 20px;
    }

    .zpz-counter-top-right {
      top: 20px;
      right: 20px;
    }

    .zpz-counter-bottom-left {
      bottom: 20px;
      left: 20px;
    }

    .zpz-counter-bottom-right {
      bottom: 20px;
      right: 20px;
    }

    .zpz-counter-separator {
      margin: 0 8px;
      opacity: 0.6;
    }

    /* Thumbnail Bar */
    .zpz-thumbnail-bar {
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      z-index: 1000;
    }

    .zpz-tb-bottom {
      bottom: 0;
      left: 0;
      right: 0;
    }

    .zpz-tb-top {
      top: 0;
      left: 0;
      right: 0;
    }

    .zpz-tb-left {
      left: 0;
      top: 0;
      bottom: 0;
    }

    .zpz-tb-right {
      right: 0;
      top: 0;
      bottom: 0;
    }

    .zpz-tb-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      padding: 10px;
    }

    .zpz-tb-track {
      display: flex;
      gap: 10px;
      height: 100%;
    }

    .zpz-tb-bottom .zpz-tb-track,
    .zpz-tb-top .zpz-tb-track {
      flex-direction: row;
    }

    .zpz-tb-left .zpz-tb-track,
    .zpz-tb-right .zpz-tb-track {
      flex-direction: column;
    }

    .zpz-tb-item {
      flex: 0 0 auto;
      cursor: pointer;
      border: 3px solid transparent;
      border-radius: 5px;
      overflow: hidden;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.1);
    }

    .zpz-tb-item:hover {
      border-color: rgba(255, 255, 255, 0.5);
      transform: scale(1.05);
    }

    .zpz-tb-item:focus-visible {
      outline: 2px solid #667eea;
      outline-offset: 2px;
    }

    .zpz-tb-item.zpz-tb-active {
      border-color: #667eea;
      box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
    }

    .zpz-tb-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .zpz-tb-bottom,
      .zpz-tb-top {
        height: 80px !important;
      }

      .zpz-arrow {
        width: 40px;
        height: 40px;
      }

      .zpz-arrow svg {
        width: 20px;
        height: 20px;
      }

      .zpz-arrow-prev {
        left: 10px;
      }

      .zpz-arrow-next {
        right: 10px;
      }

      .zpz-counter {
        font-size: 14px;
        padding: 6px 12px;
      }
    }
  `;

  document.head.appendChild(styleElement);
};

/**
 * zPhotoCarousel - Image carousel with zoom functionality
 *
 * @example
 * ```typescript
 * const carousel = new zPhotoCarousel({
 *   el: '.gallery img',
 *   carousel: true,
 *   enableThumbnails: true,
 *   enableKeyboard: true,
 *   transition: 'slide'
 * });
 *
 * carousel.onNavigate((event) => {
 *   console.log('Navigated to index:', event.to);
 * });
 * ```
 */
export class zPhotoCarousel extends zPhotoZoom {
  private _carouselState: CarouselState;
  private _carouselOptions: CarouselOptions;

  // Components
  private _thumbnailBar?: ThumbnailBar;
  private _keyboardNav?: KeyboardNav;
  private _preloader?: Preloader;
  private _swipeDetector?: SwipeDetector;
  private _navigationArrows?: NavigationArrows;
  private _counter?: Counter;

  // Event callbacks
  private _navigateCallbacks: NavigateEventCallback[] = [];
  private _slideChangeCallbacks: SlideChangeEventCallback[] = [];

  // UI elements
  private _mainImageContainer?: HTMLElement;

  constructor(options: CarouselOptions, context?: Document) {
    // Inject carousel styles
    injectCarouselStyles();

    // Call parent constructor
    super(options, context);

    // Store carousel options
    this._carouselOptions = {
      ...options,
      carousel: options.carousel !== false,
      loop: options.loop !== false,
      startIndex: options.startIndex || 0,
      enableThumbnails: options.enableThumbnails !== false,
      thumbnailHeight: options.thumbnailHeight || 120,
      thumbnailPosition: options.thumbnailPosition || 'bottom',
      thumbnailsVisible: options.thumbnailsVisible || 5,
      enableKeyboard: options.enableKeyboard !== false,
      enableArrows: options.enableArrows !== false,
      arrowPosition: options.arrowPosition || 'center',
      enableSwipe: options.enableSwipe !== false,
      transition: options.transition || 'slide',
      transitionDuration: options.transitionDuration || 400,
      autoPlay: options.autoPlay || false,
      autoPlayInterval: options.autoPlayInterval || 3000,
      pauseOnHover: options.pauseOnHover !== false,
      preloadAdjacent: options.preloadAdjacent !== false,
      preloadAll: options.preloadAll || false,
      showCounter: options.showCounter !== false,
      counterPosition: options.counterPosition || 'top-right'
    };

    // Initialize carousel state
    this._carouselState = {
      currentIndex: this._carouselOptions.startIndex,
      totalImages: this._process.images.length,
      isPlaying: false,
      playTimer: null,
      isTransitioning: false,
      direction: null
    };

    // Override the open behavior to use carousel mode
    this.initializeCarousel();
  }

  /**
   * Initialize carousel components
   */
  private initializeCarousel(): void {
    if (!this._carouselOptions.carousel) {
      return; // Carousel mode disabled
    }

    // Add indices to images
    this._process.images.forEach((img: ImageDataExtended, index: number) => {
      img.index = index;
    });

    // Initialize preloader
    if (this._carouselOptions.preloadAdjacent || this._carouselOptions.preloadAll) {
      this._preloader = new Preloader({
        images: this._process.images as ImageDataExtended[],
        preloadAdjacent: this._carouselOptions.preloadAdjacent,
        preloadAll: this._carouselOptions.preloadAll
      });
    }

    // Override image click handlers to open in carousel mode
    this._process.images.forEach((img: ImageDataExtended, index: number) => {
      // Remove default click handler and add carousel handler
      const clickHandler = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        this.openCarouselAt(index);
      };

      img.node.removeEventListener('click', clickHandler);
      img.node.addEventListener('click', clickHandler);
    });
  }

  /**
   * Open carousel at specific index
   */
  private openCarouselAt(index: number): void {
    this._carouselState.currentIndex = index;

    // Call parent open but with carousel modifications
    const image = this._process.images[index];

    // Open the viewer (will trigger onOpen callbacks)
    this.openCarouselViewer(image as ImageDataExtended);
  }

  /**
   * Open viewer in carousel mode (override)
   */
  private openCarouselViewer(image: ImageDataExtended): void {
    // Trigger parent onOpen events
    let prevent = false;
    for (let i = 0; i < this._process.eventsOpen.length; i++) {
      const event = {
        preventDefault: () => { prevent = true; },
        stopPropagation: () => {},
        target: image.node,
        instance: this
      };
      this._process.eventsOpen[i](event);
      if (prevent) return;
    }

    // Create carousel container structure
    this.createCarouselStructure();

    // Set up carousel components
    this.setupCarouselComponents();

    // Display initial image
    this.displayImage(this._carouselState.currentIndex, false);

    // Preload adjacent images
    if (this._preloader) {
      this._preloader.preloadAdjacent(this._carouselState.currentIndex);
    }

    // Start auto-play if enabled
    if (this._carouselOptions.autoPlay) {
      this.play();
    }
  }

  /**
   * Create carousel DOM structure
   */
  private createCarouselStructure(): void {
    // Get or create preview container
    if (!this._process.preview) {
      const containerPreview = this.getContainerPreview();
      this._process.preview = containerPreview;
      this._process.preview.apply();
    }

    const container = (this._process.preview as any).container;
    container.classList.add('zpz-carousel-mode');

    // Create main image container
    this._mainImageContainer = document.createElement('div');
    this._mainImageContainer.className = 'zpz-main-image-container';
    container.appendChild(this._mainImageContainer);
  }

  /**
   * Setup carousel UI components
   */
  private setupCarouselComponents(): void {
    const container = (this._process.preview as any).container;

    // Add navigation arrows
    if (this._carouselOptions.enableArrows) {
      this._navigationArrows = new NavigationArrows(
        () => this.previous(),
        () => this.next(),
        this._carouselOptions.arrowPosition
      );
      this._mainImageContainer!.appendChild(this._navigationArrows.render());
      this._navigationArrows.updateDisabledState(
        this._carouselState.currentIndex,
        this._carouselState.totalImages,
        this._carouselOptions.loop
      );
    }

    // Add counter
    if (this._carouselOptions.showCounter) {
      this._counter = new Counter(this._carouselOptions.counterPosition);
      this._mainImageContainer!.appendChild(this._counter.render());
      this._counter.update(
        this._carouselState.currentIndex + 1,
        this._carouselState.totalImages
      );
    }

    // Add thumbnail bar
    if (this._carouselOptions.enableThumbnails) {
      this._thumbnailBar = new ThumbnailBar({
        images: this._process.images as ImageDataExtended[],
        position: this._carouselOptions.thumbnailPosition,
        height: this._carouselOptions.thumbnailHeight,
        visibleCount: this._carouselOptions.thumbnailsVisible,
        currentIndex: this._carouselState.currentIndex,
        onThumbnailClick: (index: number) => this.goTo(index)
      });
      container.appendChild(this._thumbnailBar.render());
    }

    // Setup keyboard navigation
    if (this._carouselOptions.enableKeyboard) {
      this._keyboardNav = new KeyboardNav({
        onNext: () => this.next(),
        onPrevious: () => this.previous(),
        onClose: () => this.close(),
        onFirst: () => this.first(),
        onLast: () => this.last(),
        onTogglePlay: () => this.togglePlay(),
        enabled: true
      });
    }

    // Setup swipe detection
    if (this._carouselOptions.enableSwipe && this._mainImageContainer) {
      this._swipeDetector = new SwipeDetector({
        element: this._mainImageContainer,
        threshold: 50,
        onSwipeLeft: () => this.next(),
        onSwipeRight: () => this.previous(),
        isEnabled: () => {
          // Only enable swipe when image is not zoomed
          return this._process.currentImage?.scale === this._process.currentImage?.origin.scale;
        }
      });
    }
  }

  /**
   * Display image at index
   */
  private async displayImage(index: number, withTransition: boolean = true): Promise<void> {
    const image = this._process.images[index] as ImageDataExtended;

    if (!image) {
      console.error('zPhotoCarousel: Invalid image index:', index);
      return;
    }

    // Ensure image is loaded
    if (!image.loaded && this._preloader) {
      await this._preloader.preloadImage(index);
    }

    const imageNode = image.imageNode;
    if (!imageNode) {
      console.error('zPhotoCarousel: Image not loaded:', index);
      return;
    }

    // If this is the first image or no transition, just add it
    if (!this._process.currentImage || !withTransition) {
      this._mainImageContainer!.appendChild(imageNode);
      this.updateCurrentImage(image);
      return;
    }

    // Perform transition
    const currentImageNode = this._process.currentImage.imageNode;
    const transitionFn = getTransition(this._carouselOptions.transition);
    const direction = this._carouselState.direction || 'forward';

    this._carouselState.isTransitioning = true;

    try {
      await transitionFn(
        currentImageNode,
        imageNode,
        direction,
        this._carouselOptions.transitionDuration,
        this._mainImageContainer!
      );
    } catch (error) {
      console.error('zPhotoCarousel: Transition error:', error);
    } finally {
      this._carouselState.isTransitioning = false;
      this.updateCurrentImage(image);
    }
  }

  /**
   * Update current image reference
   */
  private updateCurrentImage(image: ImageDataExtended): void {
    // Update process.currentImage to maintain compatibility with parent
    this._process.currentImage = {
      image: image,
      imageNode: image.imageNode!,
      animate: false,
      factor: 1,
      distanceFactor: 1,
      scale: 1,
      origin: {} as any,
      center: { x: 0, y: 0 },
      minScale: this._process.scaleLimit.min,
      maxScale: this._process.scaleLimit.max,
      x: 0,
      y: 0,
      width: () => image.imageNode!.offsetWidth,
      height: () => image.imageNode!.offsetHeight
    };
  }

  // ========================================================================
  // Public Navigation API
  // ========================================================================

  /**
   * Navigate to next image
   */
  public next(): void {
    if (this._carouselState.isTransitioning) {
      return; // Ignore if transitioning
    }

    const nextIndex = this.getNextIndex();
    if (nextIndex === this._carouselState.currentIndex) {
      return; // Already at end and no loop
    }

    this.navigateTo(nextIndex, 'forward');
  }

  /**
   * Navigate to previous image
   */
  public previous(): void {
    if (this._carouselState.isTransitioning) {
      return;
    }

    const prevIndex = this.getPreviousIndex();
    if (prevIndex === this._carouselState.currentIndex) {
      return; // Already at start and no loop
    }

    this.navigateTo(prevIndex, 'backward');
  }

  /**
   * Go to specific index
   */
  public goTo(index: number): void {
    if (
      this._carouselState.isTransitioning ||
      index < 0 ||
      index >= this._carouselState.totalImages ||
      index === this._carouselState.currentIndex
    ) {
      return;
    }

    const direction = index > this._carouselState.currentIndex ? 'forward' : 'backward';
    this.navigateTo(index, direction);
  }

  /**
   * Go to first image
   */
  public first(): void {
    this.goTo(0);
  }

  /**
   * Go to last image
   */
  public last(): void {
    this.goTo(this._carouselState.totalImages - 1);
  }

  /**
   * Navigate to index with direction
   */
  private async navigateTo(
    index: number,
    direction: 'forward' | 'backward'
  ): Promise<void> {
    const fromIndex = this._carouselState.currentIndex;
    const image = this._process.images[index] as ImageDataExtended;

    // Trigger navigate event
    let prevent = false;
    const navigateEvent: NavigateEvent = {
      from: fromIndex,
      to: index,
      direction,
      image,
      instance: this,
      preventDefault: () => { prevent = true; },
      stopPropagation: () => {}
    };

    for (const callback of this._navigateCallbacks) {
      callback(navigateEvent);
      if (prevent) return;
    }

    // Update state
    this._carouselState.currentIndex = index;
    this._carouselState.direction = direction;

    // Display new image
    await this.displayImage(index, true);

    // Update UI components
    this.updateUIComponents();

    // Trigger slide change event
    const slideChangeEvent: SlideChangeEvent = {
      index,
      image,
      total: this._carouselState.totalImages,
      instance: this
    };

    for (const callback of this._slideChangeCallbacks) {
      callback(slideChangeEvent);
    }

    // Preload adjacent images
    if (this._preloader) {
      this._preloader.preloadAdjacent(index);
    }
  }

  /**
   * Update UI components after navigation
   */
  private updateUIComponents(): void {
    const index = this._carouselState.currentIndex;

    if (this._counter) {
      this._counter.update(index + 1, this._carouselState.totalImages);
    }

    if (this._thumbnailBar) {
      this._thumbnailBar.setActive(index);
    }

    if (this._navigationArrows) {
      this._navigationArrows.updateDisabledState(
        index,
        this._carouselState.totalImages,
        this._carouselOptions.loop
      );
    }
  }

  /**
   * Get next index (with loop support)
   */
  private getNextIndex(): number {
    const current = this._carouselState.currentIndex;
    const total = this._carouselState.totalImages;

    if (current === total - 1) {
      return this._carouselOptions.loop ? 0 : current;
    }

    return current + 1;
  }

  /**
   * Get previous index (with loop support)
   */
  private getPreviousIndex(): number {
    const current = this._carouselState.currentIndex;
    const total = this._carouselState.totalImages;

    if (current === 0) {
      return this._carouselOptions.loop ? total - 1 : current;
    }

    return current - 1;
  }

  // ========================================================================
  // Slideshow API
  // ========================================================================

  /**
   * Start slideshow
   */
  public play(): void {
    if (this._carouselState.isPlaying) {
      return; // Already playing
    }

    this._carouselState.isPlaying = true;
    this._carouselState.playTimer = setInterval(() => {
      this.next();
    }, this._carouselOptions.autoPlayInterval) as unknown as number;
  }

  /**
   * Pause slideshow
   */
  public pause(): void {
    if (!this._carouselState.isPlaying) {
      return;
    }

    this._carouselState.isPlaying = false;

    if (this._carouselState.playTimer) {
      clearInterval(this._carouselState.playTimer);
      this._carouselState.playTimer = null;
    }
  }

  /**
   * Toggle slideshow play/pause
   */
  public togglePlay(): void {
    if (this._carouselState.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // ========================================================================
  // State API
  // ========================================================================

  /**
   * Get current image index
   */
  public getCurrentIndex(): number {
    return this._carouselState.currentIndex;
  }

  /**
   * Get total number of images
   */
  public getTotalImages(): number {
    return this._carouselState.totalImages;
  }

  /**
   * Get all images
   */
  public getImages(): ImageDataExtended[] {
    return this._process.images as ImageDataExtended[];
  }

  /**
   * Check if slideshow is playing
   */
  public isPlaying(): boolean {
    return this._carouselState.isPlaying;
  }

  // ========================================================================
  // Event API
  // ========================================================================

  /**
   * Register navigate event callback
   */
  public onNavigate(callback: NavigateEventCallback, remove?: boolean): void {
    if (typeof callback !== 'function') {
      return;
    }

    if (remove) {
      const index = this._navigateCallbacks.indexOf(callback);
      if (index > -1) {
        this._navigateCallbacks.splice(index, 1);
      }
    } else {
      this._navigateCallbacks.push(callback);
    }
  }

  /**
   * Register slide change event callback
   */
  public onSlideChange(callback: SlideChangeEventCallback, remove?: boolean): void {
    if (typeof callback !== 'function') {
      return;
    }

    if (remove) {
      const index = this._slideChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this._slideChangeCallbacks.splice(index, 1);
      }
    } else {
      this._slideChangeCallbacks.push(callback);
    }
  }

  // ========================================================================
  // Cleanup
  // ========================================================================

  /**
   * Override close to cleanup carousel components
   */
  public close(): void {
    // Pause slideshow
    this.pause();

    // Destroy components
    this._thumbnailBar?.destroy();
    this._keyboardNav?.destroy();
    this._swipeDetector?.destroy();
    this._navigationArrows?.destroy();
    this._counter?.destroy();

    // Call parent close
    super.close();
  }

  /**
   * Get container preview with carousel support
   */
  private getContainerPreview(): any {
    // Use parent's getContainerPreview method
    // This is a simplified version - in production, properly handle 'this' context
    return (super as any).getContainerPreview?.call(this) || {
      container: document.createElement('div'),
      apply: () => {},
      evener: () => {}
    };
  }
}

export default zPhotoCarousel;

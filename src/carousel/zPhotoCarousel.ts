/**
 * zPhotoCarousel - Carousel Extension for zPhotoZoom
 *
 * @module carousel/zPhotoCarousel
 * @license MIT
 * @author AMGHAR Abdeslam
 */

import zPhotoZoom from '../zphotozoom';
import type {
  CarouselOptions,
  CarouselState,
  ImageDataExtended,
  ImageEventManager,
  NavigateEvent,
  SlideChangeEvent,
  NavigateEventCallback,
  SlideChangeEventCallback
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
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.85) 100%);
      backdrop-filter: blur(20px);
      z-index: 1000;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
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
      border-top: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .zpz-tb-left {
      left: 0;
      top: 0;
      bottom: 0;
      border-top: none;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .zpz-tb-right {
      right: 0;
      top: 0;
      bottom: 0;
      border-top: none;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
    }

    .zpz-tb-container {
      width: 100%;
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 12px 16px;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }

    .zpz-tb-left .zpz-tb-container,
    .zpz-tb-right .zpz-tb-container {
      overflow-x: hidden;
      overflow-y: auto;
    }

    /* Custom scrollbar for webkit browsers */
    .zpz-tb-container::-webkit-scrollbar {
      height: 6px;
      width: 6px;
    }

    .zpz-tb-container::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    .zpz-tb-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    .zpz-tb-container::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .zpz-tb-track {
      display: flex;
      gap: 12px;
      height: 100%;
      justify-content: center;
      align-items: center;
      min-width: min-content;
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
      border: 2px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      background: rgba(255, 255, 255, 0.05);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      position: relative;
    }

    .zpz-tb-item::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.2) 100%);
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    .zpz-tb-item:hover {
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    }

    .zpz-tb-item:hover::after {
      opacity: 1;
    }

    .zpz-tb-item:focus-visible {
      outline: 3px solid #667eea;
      outline-offset: 3px;
    }

    .zpz-tb-item.zpz-tb-active {
      border-color: #667eea;
      border-width: 3px;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2),
                  0 4px 20px rgba(102, 126, 234, 0.6);
      transform: scale(1.1);
    }

    .zpz-tb-item.zpz-tb-active::after {
      opacity: 0;
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
  private _carouselOptions: CarouselOptions & {
    carousel: boolean;
    loop: boolean;
    startIndex: number;
    enableThumbnails: boolean;
    thumbnailHeight: number;
    thumbnailPosition: 'top' | 'bottom' | 'left' | 'right';
    thumbnailsVisible: number;
    enableKeyboard: boolean;
    enableArrows: boolean;
    arrowPosition: 'center' | 'bottom';
    enableSwipe: boolean;
    transition: 'slide' | 'fade' | 'none';
    transitionDuration: number;
    autoPlay: boolean;
    autoPlayInterval: number;
    pauseOnHover: boolean;
    preloadAdjacent: boolean;
    preloadAll: boolean;
    showCounter: boolean;
    counterPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };

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

  // Store click handlers for proper cleanup
  private _clickHandlers: Map<HTMLElement, (e: Event) => void> = new Map();

  // Store hover handlers for pauseOnHover
  private _hoverHandlers: { mouseenter: () => void; mouseleave: () => void } | null = null;

  // Store active transition for cancellation
  private _activeTransitionController: {
    cancel: () => void;
    timeoutId?: ReturnType<typeof setTimeout>;
  } | null = null;

  // Store original event handlers from parent for restoration
  private _originalEventHandlers: Map<HTMLElement, { evener: ImageEventManager }> = new Map();

  // Helper to access parent's private _process (type assertion)
  private get process(): any {
    return (this as any)._process;
  }

  // Image state cache for persistence across navigation (reset on close)
  private _imageStates: Map<number, {
    scale: number;
    x: number;
    y: number;
    visited: boolean;
  }> = new Map();

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
      totalImages: this.process.images.length,
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
    this.process.images.forEach((img: ImageDataExtended, index: number) => {
      img.index = index;
    });

    // Initialize preloader
    if (this._carouselOptions.preloadAdjacent || this._carouselOptions.preloadAll) {
      this._preloader = new Preloader({
        images: this.process.images as ImageDataExtended[],
        preloadAdjacent: this._carouselOptions.preloadAdjacent,
        preloadAll: this._carouselOptions.preloadAll
      });
    }

    // Override image click handlers to open in carousel mode
    this.process.images.forEach((img: ImageDataExtended, index: number) => {
      // Store original event handler before removing it
      if (img.evener) {
        this._originalEventHandlers.set(img.node, { evener: img.evener });
        img.evener.remove();
      }

      // Remove any existing carousel click handler
      const existingHandler = this._clickHandlers.get(img.node);
      if (existingHandler) {
        img.node.removeEventListener('click', existingHandler);
      }

      // Create and store new carousel click handler
      const clickHandler = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        this.openCarouselAt(index);
      };

      this._clickHandlers.set(img.node, clickHandler);
      img.node.addEventListener('click', clickHandler);
    });
  }

  /**
   * Open carousel at specific index
   */
  private openCarouselAt(index: number): void {
    this._carouselState.currentIndex = index;

    // Call parent open but with carousel modifications
    const image = this.process.images[index];

    // Open the viewer (will trigger onOpen callbacks)
    this.openCarouselViewer(image as ImageDataExtended);
  }

  /**
   * Open viewer in carousel mode (override)
   */
  private openCarouselViewer(image: ImageDataExtended): void {
    // Trigger parent onOpen events
    let prevent = false;
    for (let i = 0; i < this.process.eventsOpen.length; i++) {
      const event = {
        preventDefault: () => { prevent = true; },
        stopPropagation: () => {},
        target: image.node,
        instance: this
      };
      this.process.eventsOpen[i](event);
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
    if (!this.process.preview) {
      const containerPreview = this.getContainerPreview();
      this.process.preview = containerPreview;
      this.process.preview.apply();
      // CRITICAL: Call evener() to activate zoom events (wheel, mousedown, etc.)
      this.process.preview.evener();
    }

    const container = (this.process.preview as any).container;
    container.classList.add('zpz-carousel-mode');

    // Create or reuse main image container
    if (!this._mainImageContainer || !this._mainImageContainer.parentNode) {
      this._mainImageContainer = document.createElement('div');
      this._mainImageContainer.className = 'zpz-main-image-container';
      container.appendChild(this._mainImageContainer);
    } else {
      // Clear existing content if reusing
      this._mainImageContainer.innerHTML = '';
    }
  }

  /**
   * Setup carousel UI components
   */
  private setupCarouselComponents(): void {
    const container = (this.process.preview as any).container;

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
        images: this.process.images as ImageDataExtended[],
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
          return this.process.currentImage?.scale === this.process.currentImage?.origin.scale;
        }
      });
    }

    // Setup pause on hover
    if (this._carouselOptions.pauseOnHover && this._carouselOptions.autoPlay) {
      this.setupPauseOnHover(container);
    }
  }

  /**
   * Display image at index
   */
  private async displayImage(index: number, withTransition: boolean = true): Promise<void> {
    const image = this.process.images[index] as ImageDataExtended;

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
    if (!this.process.currentImage || !withTransition) {
      this._mainImageContainer!.appendChild(imageNode);
      this.updateCurrentImage(image);
      return;
    }

    // Cancel any ongoing transition
    if (this._activeTransitionController) {
      this._activeTransitionController.cancel();
      // Clear the timeout if it exists
      if (this._activeTransitionController.timeoutId) {
        clearTimeout(this._activeTransitionController.timeoutId);
      }
      this._carouselState.isTransitioning = false;
      this._activeTransitionController = null;
    }

    // Perform transition
    const currentImageNode = this.process.currentImage.imageNode;
    const transitionFn = getTransition(this._carouselOptions.transition);
    const direction = this._carouselState.direction || 'forward';

    this._carouselState.isTransitioning = true;

    // Create cancellable transition
    let transitionCancelled = false;
    this._activeTransitionController = {
      cancel: () => {
        transitionCancelled = true;
      }
    };

    try {
      await transitionFn(
        currentImageNode,
        imageNode,
        direction,
        this._carouselOptions.transitionDuration,
        this._mainImageContainer!
      );

      // Extract timeout ID from the element (set by transition functions)
      const timeoutId = (imageNode as any).__transitionTimeoutId;
      if (timeoutId && this._activeTransitionController) {
        this._activeTransitionController.timeoutId = timeoutId;
      }

      // Only update if transition wasn't cancelled
      if (!transitionCancelled) {
        this.updateCurrentImage(image);
      }
    } catch (error) {
      if (!transitionCancelled) {
        console.error('zPhotoCarousel: Transition error:', error);
      }
    } finally {
      this._carouselState.isTransitioning = false;
      this._activeTransitionController = null;
    }
  }

  /**
   * Get center image options for current carousel configuration
   */
  private getCenterImageOptions(): import('../PluginTypes').CenterImageOptions {
    const options: import('../PluginTypes').CenterImageOptions = {
      marginPercent: 0.05, // 5% margins around image
      allowUpscale: false, // Never upscale small images
      reservedSpaces: {}
    };

    // Calculate reserved space for thumbnail bar
    if (this._carouselOptions.enableThumbnails) {
      const tbHeight = this._carouselOptions.thumbnailHeight;
      const tbPosition = this._carouselOptions.thumbnailPosition;

      if (tbPosition === 'bottom') {
        options.reservedSpaces!.bottom = tbHeight;
      } else if (tbPosition === 'top') {
        options.reservedSpaces!.top = tbHeight;
      } else if (tbPosition === 'left') {
        options.reservedSpaces!.left = tbHeight;
      } else if (tbPosition === 'right') {
        options.reservedSpaces!.right = tbHeight;
      }
    }

    return options;
  }

  /**
   * Update current image reference and apply zoom
   * Implements state persistence: first view uses calculated origin, revisits restore saved state
   */
  private updateCurrentImage(image: ImageDataExtended): void {
    const imageNode = image.imageNode!;
    const imageIndex = image.index!;

    // Temporarily set currentImage so parent methods work correctly
    // This is necessary because parent's centerImageWithOptions expects currentImage to exist
    const containerRect = this._mainImageContainer!.getBoundingClientRect();
    this.process.currentImage = {
      image: image,
      imageNode: imageNode,
      animate: false,
      factor: 1,
      distanceFactor: 1,
      scale: 1,
      origin: { width: 0, height: 0, x: 0, y: 0, scale: 1, min: 0.3, max: 5 },
      center: {
        x: containerRect.left + containerRect.width / 2,
        y: containerRect.top + containerRect.height / 2
      },
      minScale: 0.3,
      maxScale: 5,
      x: 0,
      y: 0,
      width: () => this.process.currentImage!.imageNode.offsetWidth,
      height: () => this.process.currentImage!.imageNode.offsetHeight
    };

    // Check if image has been visited before
    const savedState = this._imageStates.get(imageIndex);

    if (savedState && savedState.visited) {
      // REVISIT: Restore saved state (user manipulations preserved)
      this.setImageTransform(savedState.scale, savedState.x, savedState.y, false);
    } else {
      // FIRST VIEW: Use parent's centerImage with our custom options
      this.centerImageWithOptions(this.getCenterImageOptions());

      // Save initial state
      const state = this.getImageState();
      if (state) {
        this._imageStates.set(imageIndex, {
          scale: state.scale,
          x: state.x,
          y: state.y,
          visited: true
        });
      }
    }

    // Apply image-specific events if image is loaded
    if (image.loaded && image.evener) {
      image.evener.apply();
    }

    // Setup state tracking to save user manipulations
    this.setupStateTracking(imageIndex);
  }

  /**
   * Setup tracking of zoom/pan changes to persist them
   */
  private setupStateTracking(imageIndex: number): void {
    // Use a debounced approach to save state after user stops manipulating
    let saveTimeout: ReturnType<typeof setTimeout>;

    const saveState = () => {
      const currentImage = this.process.currentImage;
      if (!currentImage || (currentImage.image as ImageDataExtended).index !== imageIndex) {
        return; // Image changed, ignore
      }

      // Use public API to get current state
      const state = this.getImageState();
      if (state) {
        this._imageStates.set(imageIndex, {
          scale: state.scale,
          x: state.x,
          y: state.y,
          visited: true
        });
      }
    };

    // Save state after a short delay when zoom/pan stops
    const debouncedSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveState, 300);
    };

    // Listen to wheel and mouse events to detect changes
    const container = this._mainImageContainer!;
    const handlers = {
      wheel: debouncedSave,
      mouseup: debouncedSave,
      touchend: debouncedSave
    };

    // Store cleanup function
    const cleanup = () => {
      clearTimeout(saveTimeout);
      container.removeEventListener('wheel', handlers.wheel);
      container.removeEventListener('mouseup', handlers.mouseup);
      container.removeEventListener('touchend', handlers.touchend);
    };

    // Clean up previous handlers if any
    if ((container as any).__stateTrackingCleanup) {
      (container as any).__stateTrackingCleanup();
    }

    // Attach new handlers
    container.addEventListener('wheel', handlers.wheel, { passive: true });
    container.addEventListener('mouseup', handlers.mouseup);
    container.addEventListener('touchend', handlers.touchend);

    // Store cleanup for later
    (container as any).__stateTrackingCleanup = cleanup;
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
    const image = this.process.images[index] as ImageDataExtended;

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
    return this.process.images as ImageDataExtended[];
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

  /**
   * Setup pause on hover functionality
   */
  private setupPauseOnHover(container: HTMLElement): void {
    // Track if we manually paused (so we don't resume if user paused)
    let wasPausedManually = false;

    const handleMouseEnter = () => {
      if (this._carouselState.isPlaying) {
        wasPausedManually = false;
        this.pause();
      } else {
        wasPausedManually = true;
      }
    };

    const handleMouseLeave = () => {
      // Only resume if it wasn't paused manually before hovering
      if (!wasPausedManually && this._carouselOptions.autoPlay) {
        this.play();
      }
    };

    // Store handlers for cleanup
    this._hoverHandlers = {
      mouseenter: handleMouseEnter,
      mouseleave: handleMouseLeave
    };

    // Attach listeners
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
  }

  /**
   * Cleanup pause on hover listeners
   */
  private cleanupPauseOnHover(): void {
    if (!this._hoverHandlers) {
      return;
    }

    const container = (this.process.preview as any)?.container;
    if (container) {
      container.removeEventListener('mouseenter', this._hoverHandlers.mouseenter);
      container.removeEventListener('mouseleave', this._hoverHandlers.mouseleave);
    }

    this._hoverHandlers = null;
  }

  // ========================================================================
  // Cleanup
  // ========================================================================

  /**
   * Override close to cleanup carousel components and reset all state
   */
  public override close(): void {
    // Pause slideshow
    this.pause();

    // Clean up state tracking listeners
    if (this._mainImageContainer && (this._mainImageContainer as any).__stateTrackingCleanup) {
      (this._mainImageContainer as any).__stateTrackingCleanup();
      delete (this._mainImageContainer as any).__stateTrackingCleanup;
    }

    // Reset image states cache (fresh start on next open)
    this._imageStates.clear();

    // Destroy components
    this._thumbnailBar?.destroy();
    this._thumbnailBar = undefined;

    this._keyboardNav?.destroy();
    this._keyboardNav = undefined;

    this._swipeDetector?.destroy();
    this._swipeDetector = undefined;

    this._navigationArrows?.destroy();
    this._navigationArrows = undefined;

    this._counter?.destroy();
    this._counter = undefined;

    // Clean up event handlers
    this.cleanupClickHandlers();
    this.cleanupPauseOnHover();

    // Clean up main image container
    if (this._mainImageContainer) {
      this._mainImageContainer.innerHTML = '';
      // Don't remove from DOM as it will be reused or cleaned by parent
    }

    // Call parent close
    super.close();
  }

  /**
   * Clean up carousel click handlers and restore parent handlers
   */
  private cleanupClickHandlers(): void {
    // Remove carousel click handlers
    this._clickHandlers.forEach((handler, node) => {
      node.removeEventListener('click', handler);
    });
    this._clickHandlers.clear();

    // Restore parent's original event handlers from our saved copy
    this._originalEventHandlers.forEach((handlers, _node) => {
      if (handlers.evener) {
        handlers.evener.apply();
      }
    });
    this._originalEventHandlers.clear();
  }

  /**
   * Get container preview with carousel support
   */
  private getContainerPreview(): any {
    const thisInstance = this;
    const process = this.process;
    let moved = false;
    let interaction = false;

    function mouseDown(e: MouseEvent): void {
      if (e.button === 0) {
        interaction = true;
        if (!process.flags.isMoved) {
          moved = false;
        }
      }
    }

    function mousemove(_e: MouseEvent): void {
      if (process.flags.isMoved || interaction) {
        moved = true;
      }
    }

    function mouseup(this: HTMLElement, e: MouseEvent): void {
      const body = process.context.body || process.context.getElementsByTagName('body')[0];
      if (((this === e.target) || !body) && !moved && interaction) {
        try {
          thisInstance.close();
        } catch (_err) {}
      }
      moved = false;
      interaction = false;
      e.stopPropagation();
      e.preventDefault();
    }

    let body: HTMLElement | undefined;
    let container: HTMLElement;
    let context: HTMLElement | Document;

    if (process.container) {
      container = process.container;
      context = process.context;
    } else {
      container = process.context.createElement('DIV');
      container.setAttribute('class', 'ZPhotoZoom');
      body = process.context.body || process.context.getElementsByTagName('body')[0];
      context = container;
    }

    return {
      container: container,
      apply: function() {
        if (body) {
          body.appendChild(container);
        }
      },
      evener: function(remove?: boolean) {
        if (remove) {
          (context as HTMLElement).removeEventListener('mousedown', mouseDown);
          (context as HTMLElement).removeEventListener('mousemove', mousemove);
          (context as HTMLElement).removeEventListener('mouseup', mouseup as any);
        } else {
          setTimeout(function() {
            (context as HTMLElement).addEventListener('mousedown', mouseDown);
            (context as HTMLElement).addEventListener('mousemove', mousemove);
            (context as HTMLElement).addEventListener('mouseup', mouseup as any);
          }, 100);
        }
      },
    };
  }
}

export default zPhotoCarousel;

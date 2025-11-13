# Carousel API Reference

The carousel extension adds multi-image navigation capabilities with thumbnails, keyboard shortcuts, and smooth transitions.

## Constructor

### `new zPhotoCarousel(options)`

Creates a new carousel instance.

```typescript
import { zPhotoCarousel } from 'zphotozoom';

const carousel = new zPhotoCarousel({
  el: '.gallery img',
  enableThumbnails: true,
  enableKeyboard: true
});
```

## Options

### CarouselOptions

Extends `zPhotoZoomOptions` with carousel-specific options.

```typescript
interface CarouselOptions extends zPhotoZoomOptions {
  // Core options (inherited)
  el: string;
  container?: HTMLElement;
  min?: number;
  max?: number;

  // Carousel options
  enableThumbnails?: boolean;
  thumbnailHeight?: number;
  thumbnailPosition?: 'top' | 'bottom' | 'left' | 'right';
  enableKeyboard?: boolean;
  enableArrows?: boolean;
  transition?: 'slide' | 'fade' | 'none';
  loop?: boolean;
  startIndex?: number;
}
```

### Carousel-Specific Options

#### `enableThumbnails`

Show thumbnail bar with image previews.

```typescript
enableThumbnails?: boolean  // Default: true
```

**Example:**

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  enableThumbnails: true
});
```

#### `thumbnailHeight`

Height of the thumbnail bar in pixels.

```typescript
thumbnailHeight?: number  // Default: 120
```

**Example:**

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  thumbnailHeight: 100
});
```

#### `thumbnailPosition`

Position of the thumbnail bar.

```typescript
thumbnailPosition?: 'top' | 'bottom' | 'left' | 'right'  // Default: 'bottom'
```

**Example:**

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  thumbnailPosition: 'bottom'
});
```

#### `enableKeyboard`

Enable keyboard navigation shortcuts.

```typescript
enableKeyboard?: boolean  // Default: true
```

**Keyboard Shortcuts:**
- `←` / `→` : Navigate previous/next
- `Home` : Jump to first image
- `End` : Jump to last image
- `Escape` : Close viewer

**Example:**

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  enableKeyboard: true
});
```

#### `enableArrows`

Show navigation arrow buttons.

```typescript
enableArrows?: boolean  // Default: true
```

**Example:**

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  enableArrows: true
});
```

#### `transition`

Animation type for image transitions.

```typescript
transition?: 'slide' | 'fade' | 'none'  // Default: 'slide'
```

**Example:**

```typescript
// Slide animation (default)
const carousel1 = new zPhotoCarousel({
  el: '.gallery img',
  transition: 'slide'
});

// Fade animation
const carousel2 = new zPhotoCarousel({
  el: '.gallery img',
  transition: 'fade'
});

// No animation (instant)
const carousel3 = new zPhotoCarousel({
  el: '.gallery img',
  transition: 'none'
});
```

#### `loop`

Enable circular navigation (last → first, first → last).

```typescript
loop?: boolean  // Default: true
```

**Example:**

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  loop: true
});
```

#### `startIndex`

Starting image index (0-based).

```typescript
startIndex?: number  // Default: 0
```

**Example:**

```typescript
// Start at the third image
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  startIndex: 2
});
```

## Navigation Methods

### `next()`

Navigate to the next image.

```typescript
next(): void
```

**Example:**

```typescript
document.querySelector('.btn-next').addEventListener('click', () => {
  carousel.next();
});
```

### `previous()`

Navigate to the previous image.

```typescript
previous(): void
```

**Example:**

```typescript
document.querySelector('.btn-prev').addEventListener('click', () => {
  carousel.previous();
});
```

### `goTo(index)`

Navigate to a specific image by index (0-based).

```typescript
goTo(index: number): void
```

**Example:**

```typescript
// Jump to the 5th image
carousel.goTo(4);

// With button
document.querySelector('.btn-goto-5').addEventListener('click', () => {
  carousel.goTo(4);
});
```

### `first()`

Jump to the first image.

```typescript
first(): void
```

**Example:**

```typescript
document.querySelector('.btn-first').addEventListener('click', () => {
  carousel.first();
});
```

### `last()`

Jump to the last image.

```typescript
last(): void
```

**Example:**

```typescript
document.querySelector('.btn-last').addEventListener('click', () => {
  carousel.last();
});
```

## State Methods

### `getCurrentIndex()`

Get the current image index (0-based).

```typescript
getCurrentIndex(): number
```

**Example:**

```typescript
const currentIndex = carousel.getCurrentIndex();
console.log(`Viewing image ${currentIndex + 1}`);
```

### `getTotalImages()`

Get the total number of images.

```typescript
getTotalImages(): number
```

**Example:**

```typescript
const total = carousel.getTotalImages();
console.log(`Total images: ${total}`);
```

### `isOpen()`

Check if the carousel is currently open.

```typescript
isOpen(): boolean
```

**Example:**

```typescript
if (carousel.isOpen()) {
  console.log('Carousel is open');
}
```

## Event Methods

### `onNavigate(callback)`

Triggered before navigating to a new image.

```typescript
onNavigate(callback: (event: NavigateEvent) => void): void
```

**NavigateEvent:**

```typescript
interface NavigateEvent {
  from: number;        // Previous index
  to: number;          // New index
  direction: 'forward' | 'backward';
  instance: zPhotoCarousel;
}
```

**Example:**

```typescript
carousel.onNavigate((event) => {
  console.log(`Navigating from ${event.from} to ${event.to}`);
  console.log(`Direction: ${event.direction}`);

  // Track analytics
  analytics.track('carousel_navigate', {
    from: event.from,
    to: event.to
  });
});
```

### `onSlideChange(callback)`

Triggered after slide change completes.

```typescript
onSlideChange(callback: (event: SlideChangeEvent) => void): void
```

**SlideChangeEvent:**

```typescript
interface SlideChangeEvent {
  index: number;       // Current index
  total: number;       // Total images
  instance: zPhotoCarousel;
}
```

**Example:**

```typescript
carousel.onSlideChange((event) => {
  console.log(`Now viewing image ${event.index + 1} of ${event.total}`);

  // Update custom UI
  updateCounter(event.index + 1, event.total);
});
```

### `onOpen(callback)` & `onClose(callback)`

Inherited from `zPhotoZoom`. See [Core API](./core-api.md#onopencallback-remove).

**Example:**

```typescript
carousel.onOpen((event) => {
  console.log('Carousel opened');
});

carousel.onClose((event) => {
  console.log('Carousel closed');
});
```

## State Persistence

The carousel automatically remembers zoom and position for each image as you navigate. When you return to a previously viewed image (without closing the carousel), it restores your previous zoom and position.

**Behavior:**

1. **First view**: Image is centered and fit to available space
2. **Navigate away**: Position and zoom are saved
3. **Navigate back**: Previous state is restored
4. **Close carousel**: All states are reset

**Example:**

```typescript
// Open carousel, view image 1
carousel.goTo(0);
// Zoom in and pan around

// Navigate to image 2
carousel.next();
// This image will be freshly centered

// Navigate back to image 1
carousel.previous();
// Returns to your previous zoom/position!

// Close carousel
carousel.close();
// All states reset; next time will be fresh
```

## Advanced Usage

### Custom Navigation Controls

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  enableArrows: false  // Hide default arrows
});

// Custom controls
document.querySelector('.my-prev-btn').addEventListener('click', () => {
  carousel.previous();
});

document.querySelector('.my-next-btn').addEventListener('click', () => {
  carousel.next();
});

// Pagination dots
const totalImages = carousel.getTotalImages();
for (let i = 0; i < totalImages; i++) {
  const dot = document.createElement('button');
  dot.addEventListener('click', () => carousel.goTo(i));
  document.querySelector('.pagination').appendChild(dot);
}
```

### Progress Tracking

```typescript
carousel.onSlideChange((event) => {
  const progress = ((event.index + 1) / event.total) * 100;
  document.querySelector('.progress-bar').style.width = `${progress}%`;
});
```

### Synchronized UI

```typescript
carousel.onSlideChange((event) => {
  // Update counter
  document.querySelector('.current').textContent = event.index + 1;
  document.querySelector('.total').textContent = event.total;

  // Update image info
  const currentImage = carousel.getImages()[event.index];
  document.querySelector('.image-title').textContent = currentImage.alt;
});
```

### Conditional Navigation

```typescript
carousel.onNavigate((event) => {
  // Prevent navigating to certain images
  if (restrictedIndices.includes(event.to)) {
    event.preventDefault();
    alert('This image is restricted');
  }
});
```

## CSS Customization

### Thumbnail Bar

```css
/* Thumbnail bar */
.zpz-thumbnail-bar {
  background: rgba(0, 0, 0, 0.9);
}

/* Individual thumbnail */
.zpz-tb-item {
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

/* Hover state */
.zpz-tb-item:hover {
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

/* Active thumbnail */
.zpz-tb-item.zpz-tb-active {
  border-color: #667eea;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}
```

### Navigation Arrows

```css
/* Arrow buttons */
.zpz-arrow {
  background: rgba(0, 0, 0, 0.5);
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.zpz-arrow:hover {
  background: rgba(102, 126, 234, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.zpz-arrow-prev {
  left: 20px;
}

.zpz-arrow-next {
  right: 20px;
}
```

### Image Counter

```css
.zpz-counter {
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-size: 16px;
}

.zpz-counter-top-right {
  top: 20px;
  right: 20px;
}
```

## Plugin System Integration

The carousel is built on the plugin system. See [Plugin System](./plugin-system.md) for details on extending functionality.

**Example:**

```typescript
import { zPhotoCarousel, PluginAPI } from 'zphotozoom';

const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  initialize(instance: zPhotoCarousel, api: PluginAPI) {
    console.log('Plugin initialized with carousel');
  }
};

const carousel = new zPhotoCarousel({
  el: '.gallery img'
});

carousel.registerPlugin(myPlugin);
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import {
  zPhotoCarousel,
  CarouselOptions,
  NavigateEvent,
  SlideChangeEvent
} from 'zphotozoom';

const options: CarouselOptions = {
  el: '.gallery img',
  enableThumbnails: true,
  thumbnailHeight: 120
};

const carousel = new zPhotoCarousel(options);

carousel.onNavigate((event: NavigateEvent) => {
  console.log(event.direction);
});
```

## Performance Considerations

### Pre-loading Strategy

The carousel automatically pre-loads adjacent images for smooth navigation:

```typescript
// When viewing image 3:
// - Image 2 (previous) is pre-loaded
// - Image 4 (next) is pre-loaded
```

### GPU Acceleration

All transitions use GPU-accelerated transforms for 60fps performance.

### Memory Management

States are cleared when carousel closes to prevent memory leaks:

```typescript
carousel.close();  // All cached states are freed
```

## Next Steps

- [Plugin System](./plugin-system.md) - Extend carousel functionality
- [Examples](./examples.md) - More usage examples
- [Core API](./core-api.md) - Base viewer API

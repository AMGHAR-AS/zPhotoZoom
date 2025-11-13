# zPhotoZoom Carousel Extension

A powerful carousel/gallery extension for zPhotoZoom that adds multi-image navigation with thumbnails, keyboard shortcuts, and smooth transitions.

## ✨ Features

### 🎠 Carousel Navigation
- **Next/Previous Navigation** - Arrow buttons and keyboard shortcuts
- **Direct Navigation** - Click thumbnails to jump to any image
- **Circular Loop** - Seamlessly loop from last to first image (optional)
- **First/Last** - Quick jump to gallery endpoints

### 🖼️ Thumbnail Bar
- **Visual Preview** - Scrollable bar showing all images
- **Active Indicator** - Highlighted current image
- **Auto-scroll** - Automatically centers active thumbnail
- **Flexible Positioning** - Top, bottom, left, or right placement
- **Click to Navigate** - Direct navigation by clicking thumbnails

### ⌨️ Keyboard Navigation
- `←` / `→` - Navigate previous/next
- `Home` - Jump to first image
- `End` - Jump to last image
- `Escape` - Close viewer
- `Space` - Toggle slideshow (optional)

### 📱 Touch & Swipe
- **Swipe Gestures** - Swipe left/right to navigate on mobile
- **Smart Detection** - Automatically disabled when image is zoomed
- **Fast & Responsive** - Native touch event handling

### 🎬 Smooth Transitions
- **Slide** - Horizontal sliding animation
- **Fade** - Cross-fade between images
- **None** - Instant switching
- **Configurable Duration** - Customize animation speed

### 🔢 Image Counter
- **Position Display** - Shows "3 / 12" format
- **Flexible Placement** - Four corner positions
- **Accessibility** - ARIA labels for screen readers

### 🎥 Slideshow Mode
- **Auto-play** - Automatic progression through images
- **Configurable Interval** - Set time between slides
- **Pause on Hover** - Optional user interaction detection
- **Play/Pause Control** - Programmatic control

### ⚡ Performance
- **Smart Preloading** - Preload adjacent images for instant navigation
- **Lazy Loading** - Load images on demand
- **GPU Acceleration** - Smooth 60fps transitions
- **Optimized Rendering** - Efficient DOM manipulation

## 📦 Installation

```bash
npm install zphotozoom
```

## 🚀 Quick Start

```typescript
import { zPhotoCarousel } from 'zphotozoom';

const carousel = new zPhotoCarousel({
  el: '.gallery img',
  enableThumbnails: true,
  enableKeyboard: true,
  transition: 'slide'
});
```

## 📖 API Documentation

### Constructor Options

```typescript
interface CarouselOptions {
  // Base zPhotoZoom options
  el: string;                          // CSS selector for images
  container?: HTMLElement;             // Optional container
  min?: number;                        // Min zoom scale (default: 0.3)
  max?: number;                        // Max zoom scale (default: 5)

  // Carousel behavior
  carousel?: boolean;                  // Enable carousel mode (default: true)
  loop?: boolean;                      // Enable circular navigation (default: true)
  startIndex?: number;                 // Starting image index (default: 0)

  // Thumbnails
  enableThumbnails?: boolean;          // Show thumbnail bar (default: true)
  thumbnailHeight?: number;            // Thumbnail bar height in px (default: 120)
  thumbnailPosition?: 'top' | 'bottom' | 'left' | 'right'; // (default: 'bottom')
  thumbnailsVisible?: number;          // Number visible at once (default: 5)

  // Navigation
  enableKeyboard?: boolean;            // Enable keyboard shortcuts (default: true)
  enableArrows?: boolean;              // Show prev/next arrows (default: true)
  arrowPosition?: 'center' | 'bottom'; // Arrow position (default: 'center')
  enableSwipe?: boolean;               // Enable touch swipe (default: true)

  // Transitions
  transition?: 'slide' | 'fade' | 'none'; // Animation type (default: 'slide')
  transitionDuration?: number;         // Duration in ms (default: 400)

  // Slideshow
  autoPlay?: boolean;                  // Auto-start slideshow (default: false)
  autoPlayInterval?: number;           // Interval in ms (default: 3000)
  pauseOnHover?: boolean;              // Pause on hover (default: true)

  // Preloading
  preloadAdjacent?: boolean;           // Preload adjacent images (default: true)
  preloadAll?: boolean;                // Preload all images (default: false)

  // Counter
  showCounter?: boolean;               // Show image counter (default: true)
  counterPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}
```

### Navigation Methods

```typescript
// Navigate to next image
carousel.next();

// Navigate to previous image
carousel.previous();

// Go to specific index (0-based)
carousel.goTo(3);

// Jump to first image
carousel.first();

// Jump to last image
carousel.last();
```

### Slideshow Methods

```typescript
// Start slideshow
carousel.play();

// Pause slideshow
carousel.pause();

// Toggle play/pause
carousel.togglePlay();
```

### State Methods

```typescript
// Get current image index
const index = carousel.getCurrentIndex(); // Returns: number

// Get total number of images
const total = carousel.getTotalImages(); // Returns: number

// Check if slideshow is playing
const playing = carousel.isPlaying(); // Returns: boolean

// Get all images
const images = carousel.getImages(); // Returns: ImageDataExtended[]
```

### Event Listeners

#### onNavigate

Triggered before navigating to a new image.

```typescript
carousel.onNavigate((event) => {
  console.log(`Navigating from ${event.from} to ${event.to}`);
  console.log(`Direction: ${event.direction}`); // 'forward' | 'backward'

  // Prevent navigation
  // event.preventDefault();
});
```

#### onSlideChange

Triggered after slide change completes.

```typescript
carousel.onSlideChange((event) => {
  console.log(`Now viewing image ${event.index + 1} of ${event.total}`);
  console.log('Image data:', event.image);
});
```

#### onOpen / onClose

Inherited from zPhotoZoom.

```typescript
carousel.onOpen((event) => {
  console.log('Carousel opened:', event.target);
});

carousel.onClose((event) => {
  console.log('Carousel closed');
});
```

### Cleanup

```typescript
// Close and cleanup carousel
carousel.close();
```

## 💡 Usage Examples

### Basic Carousel

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img'
});
```

### Full Configuration

```typescript
const carousel = new zPhotoCarousel({
  // Images
  el: '.gallery img',

  // Zoom
  min: 0.5,
  max: 10,

  // Carousel
  loop: true,
  startIndex: 0,

  // Thumbnails
  enableThumbnails: true,
  thumbnailHeight: 100,
  thumbnailPosition: 'bottom',

  // Navigation
  enableKeyboard: true,
  enableArrows: true,
  enableSwipe: true,

  // Transitions
  transition: 'slide',
  transitionDuration: 500,

  // Slideshow
  autoPlay: false,
  autoPlayInterval: 4000,

  // Preloading
  preloadAdjacent: true,

  // Counter
  showCounter: true,
  counterPosition: 'top-right'
});
```

### With Event Tracking

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img'
});

// Track navigation
carousel.onNavigate((event) => {
  analytics.track('carousel_navigate', {
    from: event.from,
    to: event.to,
    direction: event.direction
  });
});

// Track viewing
carousel.onSlideChange((event) => {
  analytics.track('image_view', {
    index: event.index,
    total: event.total,
    imageUrl: event.image.src
  });
});
```

### Programmatic Control

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img'
});

// Navigation controls
document.querySelector('.btn-next').addEventListener('click', () => {
  carousel.next();
});

document.querySelector('.btn-prev').addEventListener('click', () => {
  carousel.previous();
});

// Jump to specific image
document.querySelector('.btn-goto-5').addEventListener('click', () => {
  carousel.goTo(4); // 0-based index
});

// Slideshow controls
document.querySelector('.btn-play').addEventListener('click', () => {
  carousel.play();
});

document.querySelector('.btn-pause').addEventListener('click', () => {
  carousel.pause();
});

// Get current state
document.querySelector('.btn-info').addEventListener('click', () => {
  console.log(`Image ${carousel.getCurrentIndex() + 1} of ${carousel.getTotalImages()}`);
  console.log(`Playing: ${carousel.isPlaying()}`);
});
```

### Fade Transition

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  transition: 'fade',
  transitionDuration: 600
});
```

### No Thumbnails

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  enableThumbnails: false,
  showCounter: true
});
```

### Auto-play Slideshow

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  autoPlay: true,
  autoPlayInterval: 5000,
  loop: true,
  transition: 'fade'
});
```

### Preload All Images

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  preloadAll: true // Preload everything upfront
});
```

## 🎨 Customization

### CSS Classes

You can customize the carousel appearance by overriding these CSS classes:

```css
/* Main carousel container */
.ZPhotoZoom.zpz-carousel-mode { }

/* Navigation arrows */
.zpz-arrow { }
.zpz-arrow-prev { }
.zpz-arrow-next { }
.zpz-arrow:hover { }
.zpz-arrow:disabled { }

/* Counter */
.zpz-counter { }
.zpz-counter-top-left { }
.zpz-counter-top-right { }
.zpz-counter-bottom-left { }
.zpz-counter-bottom-right { }

/* Thumbnail bar */
.zpz-thumbnail-bar { }
.zpz-tb-bottom { }
.zpz-tb-top { }
.zpz-tb-left { }
.zpz-tb-right { }
.zpz-tb-item { }
.zpz-tb-item:hover { }
.zpz-tb-item.zpz-tb-active { }
```

### Example Customization

```css
/* Larger arrows */
.zpz-arrow {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
}

/* Colored active thumbnail border */
.zpz-tb-item.zpz-tb-active {
  border-color: #ff6b6b;
  box-shadow: 0 0 15px rgba(255, 107, 107, 0.6);
}

/* Larger counter */
.zpz-counter {
  font-size: 20px;
  padding: 12px 24px;
}
```

## 🌐 Browser Support

Same as zPhotoZoom core:
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- iOS Safari: 12+
- Chrome Android: Last 2 versions

## 📱 Mobile Support

The carousel is fully responsive and supports:
- ✅ Touch events
- ✅ Swipe gestures
- ✅ Pinch-to-zoom (on zoomed images)
- ✅ Responsive layout
- ✅ Mobile-optimized thumbnails

## ♿ Accessibility

- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Focus indicators
- ✅ Screen reader support
- ✅ Semantic HTML

## 🔧 TypeScript Support

Full TypeScript definitions included:

```typescript
import {
  zPhotoCarousel,
  CarouselOptions,
  NavigateEvent,
  SlideChangeEvent,
  ImageDataExtended
} from 'zphotozoom';
```

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

AMGHAR Abdeslam

## 🙏 Acknowledgments

- Inspired by Google Picasa viewer
- Built on top of zPhotoZoom core
- Modern web standards and best practices

---

Made with ❤️ by AMGHAR Abdeslam

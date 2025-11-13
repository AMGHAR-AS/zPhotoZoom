# zPhotoZoom

[![npm version](https://badge.fury.io/js/zphotozoom.svg)](https://www.npmjs.com/package/zphotozoom)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

A modern, feature-rich TypeScript library for creating interactive image zoom viewers with seamless touch and mouse support. Includes an optional carousel/gallery extension for multi-image navigation with thumbnails.

## ✨ Features

### Core Features
- 🖱️ **Mouse Wheel Zoom** - Smooth zooming with configurable limits
- 👆 **Touch Gestures** - Pinch-to-zoom and drag-to-pan on mobile devices
- 📱 **Responsive Design** - Automatic repositioning on window resize
- ⚡ **Performance** - GPU-accelerated transforms for smooth 60fps animations
- 🎨 **Customizable** - Configurable zoom limits and container modes
- 📦 **Lightweight** - ~15KB minified + gzipped (core only)
- 🔧 **TypeScript** - Full type definitions included
- 🎯 **Zero Dependencies** - No external libraries required
- 🌐 **Browser Support** - Works on all modern browsers

### Carousel Extension
- 🎠 **Multi-Image Navigation** - Browse through image galleries with smooth transitions
- 🖼️ **Thumbnail Bar** - Visual preview with scrollable thumbnails
- ⌨️ **Keyboard Navigation** - Arrow keys, Home, End, Escape support
- 📱 **Touch Swipe** - Swipe left/right to navigate on mobile
- 🔄 **State Persistence** - Remembers zoom/position when navigating between images
- 🎬 **Smooth Transitions** - Configurable slide and fade animations
- 🔢 **Image Counter** - Shows current position (e.g., "3 / 12")
- 🔌 **Plugin System** - Extensible architecture for custom features

## 📦 Installation

### NPM

```bash
npm install zphotozoom
```

### Yarn

```bash
yarn add zphotozoom
```

## 🚀 Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>zPhotoZoom Demo</title>
</head>
<body>
  <img src="image.jpg" class="zoomable" alt="Zoomable Image">
  
  <script type="module">
    import zPhotoZoom from 'zphotozoom';
    
    const viewer = new zPhotoZoom({
      el: '.zoomable',
      min: 0.5,
      max: 5
    });
  </script>
</body>
</html>
```

### With TypeScript

```typescript
import zPhotoZoom, { zPhotoZoomOptions, ViewerEvent } from 'zphotozoom';

const options: zPhotoZoomOptions = {
  el: '.gallery-image',
  min: 0.3,
  max: 10
};

const viewer = new zPhotoZoom(options);

// Event listeners
viewer.onOpen((event: ViewerEvent) => {
  console.log('Image opened:', event.target);
});

viewer.onClose((event: ViewerEvent) => {
  console.log('Image closed:', event.target);
});
```

### Carousel Usage

```typescript
import { zPhotoCarousel } from 'zphotozoom';

const carousel = new zPhotoCarousel({
  el: '.gallery img',
  min: 0.5,
  max: 8,

  // Carousel options
  enableThumbnails: true,
  thumbnailHeight: 120,
  thumbnailPosition: 'bottom',
  enableKeyboard: true,
  enableArrows: true,
  transition: 'slide'
});

// Navigation
carousel.next();
carousel.previous();
carousel.goTo(2);

// Events
carousel.onNavigate((event) => {
  console.log(`Navigating from ${event.from} to ${event.to}`);
});
```

## 📖 API Documentation

### Constructor

```typescript
new zPhotoZoom(options?: zPhotoZoomOptions, context?: Document)
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `el` | `string` | required | CSS selector for target images |
| `container` | `HTMLElement` | `undefined` | Optional container for embedded mode |
| `min` | `number` | `0.3` | Minimum zoom scale limit |
| `max` | `number` | `5` | Maximum zoom scale limit |

### Methods

#### `onOpen(callback, remove?)`

Register a callback when the viewer opens.

```typescript
viewer.onOpen((event) => {
  console.log('Viewer opened for:', event.target);
});
```

#### `onClose(callback, remove?)`

Register a callback when the viewer closes.

```typescript
viewer.onClose((event) => {
  console.log('Viewer closed');
});
```

#### `stop()`

Stops all interactions (zoom, pan, etc.).

```typescript
viewer.stop();
```

#### `resume()`

Resumes interactions after being stopped.

```typescript
viewer.resume();
```

#### `reset()`

Resets the current image to its original centered state.

```typescript
viewer.reset();
```

#### `close()`

Closes the viewer if currently open.

```typescript
viewer.close();
```

#### `update()`

Forces an update of the image scale and position.

```typescript
viewer.update();
```

#### `change(selector)`

Changes the target selector and reinitializes images.

```typescript
viewer.change('.new-selector');
```

## 🎨 Usage Examples

### Multiple Images Gallery

```html
<div class="gallery">
  <img src="photo1.jpg" class="zoomable" alt="Photo 1">
  <img src="photo2.jpg" class="zoomable" alt="Photo 2">
  <img src="photo3.jpg" class="zoomable" alt="Photo 3">
</div>

<script type="module">
  import zPhotoZoom from 'zphotozoom';
  
  const gallery = new zPhotoZoom({
    el: '.zoomable',
    min: 0.5,
    max: 8
  });
</script>
```

### Embedded Container Mode

```html
<div id="image-container">
  <img src="product.jpg" class="product-image" alt="Product">
</div>

<script type="module">
  import zPhotoZoom from 'zphotozoom';
  
  const container = document.getElementById('image-container');
  
  new zPhotoZoom({
    el: '.product-image',
    container: container
  });
</script>
```

### Dynamic Image Loading

```typescript
import zPhotoZoom from 'zphotozoom';

const viewer = new zPhotoZoom({ el: '.dynamic-image' });

// Load new images dynamically
fetch('/api/images')
  .then(response => response.json())
  .then(images => {
    const container = document.querySelector('.image-grid');
    
    images.forEach(img => {
      const element = document.createElement('img');
      element.src = img.url;
      element.className = 'dynamic-image';
      container.appendChild(element);
    });
    
    // Reinitialize viewer with new images
    viewer.change('.dynamic-image');
  });
```

### Event Handling

```typescript
import zPhotoZoom from 'zphotozoom';

const viewer = new zPhotoZoom({ el: '.image' });

// Track analytics
viewer.onOpen((event) => {
  analytics.track('Image Viewed', {
    imageUrl: event.target.src,
    timestamp: Date.now()
  });
});

// Prevent closing in certain conditions
viewer.onClose((event) => {
  if (shouldPreventClose()) {
    event.preventDefault();
  }
});
```

### Programmatic Control

```typescript
import zPhotoZoom from 'zphotozoom';

const viewer = new zPhotoZoom({ el: '.controlled-image' });

// Pause interactions during video playback
video.addEventListener('play', () => {
  viewer.stop();
});

video.addEventListener('pause', () => {
  viewer.resume();
});

// Reset zoom on specific events
document.querySelector('.reset-btn').addEventListener('click', () => {
  viewer.reset();
});

// Close viewer programmatically
document.querySelector('.close-btn').addEventListener('click', () => {
  viewer.close();
});
```

## 🎯 Advanced Configuration

### Custom Zoom Limits

```typescript
// Very restricted zoom
const restrictedViewer = new zPhotoZoom({
  el: '.image',
  min: 0.8,
  max: 2
});

// Extreme zoom capability
const detailViewer = new zPhotoZoom({
  el: '.detailed-image',
  min: 0.1,
  max: 20
});
```

### Multiple Instances

```typescript
// Different galleries with different settings
const thumbnailViewer = new zPhotoZoom({
  el: '.thumbnail',
  min: 1,
  max: 3
});

const fullsizeViewer = new zPhotoZoom({
  el: '.fullsize',
  min: 0.5,
  max: 10
});
```

## 🌐 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |
| iOS Safari | 12+ |
| Chrome Android | Last 2 versions |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Google Picasa style
- Built with TypeScript and modern web standards

## 🗺️ Roadmap

### Completed ✅
- [x] Gallery navigation (prev/next)
- [x] Thumbnail strip in viewer
- [x] Plugin system for extensibility
- [x] Keyboard navigation support
- [x] Animation easing configuration

### In Progress 🚧
- [ ] ARIA attributes for accessibility improvements
- [ ] Enhanced keyboard shortcuts

### Planned 📋
- [ ] Image rotation support
- [ ] Virtual scrolling for large galleries
- [ ] Fullscreen API integration
- [ ] Video support

---

Made with ❤️ by AMGHAR Abdeslam

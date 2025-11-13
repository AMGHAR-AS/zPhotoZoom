# Usage Examples

Comprehensive examples for common use cases.

## Table of Contents

- [Basic Examples](#basic-examples)
- [Carousel Examples](#carousel-examples)
- [Plugin Examples](#plugin-examples)
- [Advanced Examples](#advanced-examples)
- [Real-World Examples](#real-world-examples)

## Basic Examples

### Simple Image Zoom

```html
<!DOCTYPE html>
<html>
<head>
  <title>Simple Zoom</title>
</head>
<body>
  <img src="photo.jpg" class="zoomable" alt="Photo">

  <script type="module">
    import zPhotoZoom from 'zphotozoom';

    new zPhotoZoom({
      el: '.zoomable'
    });
  </script>
</body>
</html>
```

### Multiple Images

```html
<div class="gallery">
  <img src="photo1.jpg" class="zoomable">
  <img src="photo2.jpg" class="zoomable">
  <img src="photo3.jpg" class="zoomable">
</div>

<script type="module">
  import zPhotoZoom from 'zphotozoom';

  new zPhotoZoom({
    el: '.zoomable',
    min: 0.5,
    max: 8
  });
</script>
```

### Embedded Container

```html
<div id="product-viewer" style="width: 600px; height: 400px;">
  <img src="product.jpg" class="product-img">
</div>

<script type="module">
  import zPhotoZoom from 'zphotozoom';

  const container = document.getElementById('product-viewer');

  new zPhotoZoom({
    el: '.product-img',
    container: container,
    min: 1,
    max: 4
  });
</script>
```

## Carousel Examples

### Basic Carousel

```typescript
import { zPhotoCarousel } from 'zphotozoom';

const carousel = new zPhotoCarousel({
  el: '.gallery img'
});
```

### Full-Featured Carousel

```typescript
import { zPhotoCarousel } from 'zphotozoom';

const carousel = new zPhotoCarousel({
  el: '.gallery img',

  // Zoom settings
  min: 0.5,
  max: 8,

  // Carousel features
  enableThumbnails: true,
  thumbnailHeight: 120,
  thumbnailPosition: 'bottom',
  enableKeyboard: true,
  enableArrows: true,
  transition: 'slide',
  loop: true
});
```

### Minimal Carousel (No Thumbnails)

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  enableThumbnails: false,
  enableArrows: true,
  transition: 'fade'
});
```

### Custom Navigation

```typescript
const carousel = new zPhotoCarousel({
  el: '.gallery img',
  enableArrows: false  // Disable built-in arrows
});

// Custom controls
document.querySelector('.my-prev').addEventListener('click', () => {
  carousel.previous();
});

document.querySelector('.my-next').addEventListener('click', () => {
  carousel.next();
});

// Pagination
const total = carousel.getTotalImages();
const pagination = document.querySelector('.pagination');

for (let i = 0; i < total; i++) {
  const dot = document.createElement('button');
  dot.className = 'dot';
  dot.addEventListener('click', () => carousel.goTo(i));

  pagination.appendChild(dot);
}

// Update active dot
carousel.onSlideChange((event) => {
  document.querySelectorAll('.dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === event.index);
  });
});
```

## Plugin Examples

### Analytics Tracking

```typescript
const analyticsPlugin = {
  name: 'analytics',

  initialize(instance, api) {
    console.log('Analytics initialized');
  },

  afterOpen(event) {
    // Track opens
    gtag('event', 'image_opened', {
      image_url: event.target.src
    });
  },

  afterClose(event) {
    // Track closes
    gtag('event', 'viewer_closed');
  }
};

viewer.registerPlugin(analyticsPlugin);
```

### Image Information Overlay

```typescript
const infoPlugin = {
  name: 'image-info',
  overlay: null,

  initialize(instance, api) {
    this.api = api;
  },

  afterOpen(event) {
    const container = this.api.getPreviewContainer();
    if (!container) return;

    // Create info overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: sans-serif;
      z-index: 1000;
    `;

    const img = event.target;
    this.overlay.innerHTML = `
      <div><strong>Filename:</strong> ${img.src.split('/').pop()}</div>
      <div><strong>Alt:</strong> ${img.alt || 'N/A'}</div>
      <div><strong>Dimensions:</strong> ${img.naturalWidth} x ${img.naturalHeight}</div>
    `;

    container.appendChild(this.overlay);
  },

  beforeClose(event) {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
      this.overlay = null;
    }
  }
};

viewer.registerPlugin(infoPlugin);
```

### Keyboard Shortcuts

```typescript
const shortcutsPlugin = {
  name: 'keyboard-shortcuts',

  initialize(instance, api) {
    this.api = api;
    this.keyHandler = this.handleKey.bind(this);
  },

  afterOpen(event) {
    document.addEventListener('keydown', this.keyHandler);
  },

  beforeClose(event) {
    document.removeEventListener('keydown', this.keyHandler);
  },

  handleKey(e) {
    switch(e.key) {
      case '+':
      case '=':
        // Zoom in
        const state = this.api.getImageState();
        if (state) {
          this.api.setImageTransform(
            state.scale * 1.2,
            state.x,
            state.y,
            true
          );
        }
        break;

      case '-':
        // Zoom out
        const state2 = this.api.getImageState();
        if (state2) {
          this.api.setImageTransform(
            state2.scale * 0.8,
            state2.x,
            state2.y,
            true
          );
        }
        break;

      case '0':
        // Reset
        this.api.resetImage();
        break;
    }
  },

  destroy() {
    document.removeEventListener('keydown', this.keyHandler);
  }
};

viewer.registerPlugin(shortcutsPlugin);
```

## Advanced Examples

### Dynamic Image Loading

```typescript
const carousel = new zPhotoCarousel({
  el: '.dynamic-image'
});

// Load images from API
async function loadImages() {
  const response = await fetch('/api/gallery/123/images');
  const images = await response.json();

  const container = document.querySelector('.gallery');

  // Clear existing
  container.innerHTML = '';

  // Add new images
  images.forEach(img => {
    const element = document.createElement('img');
    element.src = img.url;
    element.alt = img.title;
    element.className = 'dynamic-image';
    container.appendChild(element);
  });

  // Reinitialize carousel
  carousel.change('.dynamic-image');
}

// Load on button click
document.querySelector('.load-btn').addEventListener('click', loadImages);
```

### Progressive Enhancement

```html
<!-- Works without JavaScript -->
<div class="gallery">
  <a href="large-photo1.jpg" class="image-link">
    <img src="thumb-photo1.jpg" alt="Photo 1">
  </a>
  <a href="large-photo2.jpg" class="image-link">
    <img src="thumb-photo2.jpg" alt="Photo 2">
  </a>
</div>

<script type="module">
  import { zPhotoCarousel } from 'zphotozoom';

  // Enhance with carousel
  const links = document.querySelectorAll('.image-link');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
    });

    const img = link.querySelector('img');
    img.src = link.href;  // Use full-size image
  });

  new zPhotoCarousel({
    el: '.image-link img'
  });
</script>
```

### Lazy Loading Integration

```typescript
// Using Intersection Observer
const images = document.querySelectorAll('[data-src]');

const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      imageObserver.unobserve(img);
    }
  });
});

images.forEach(img => imageObserver.observe(img));

// Initialize carousel after lazy load
const carousel = new zPhotoCarousel({
  el: '.gallery img'
});

// Update carousel when images load
images.forEach(img => {
  img.addEventListener('load', () => {
    carousel.change('.gallery img');
  }, { once: true });
});
```

### State Persistence with LocalStorage

```typescript
const statePlugin = {
  name: 'state-persistence',
  storageKey: 'zpz-states',

  initialize(instance, api) {
    this.api = api;
  },

  afterOpen(event) {
    // Load saved state
    const imageUrl = event.target.src;
    const saved = this.loadState(imageUrl);

    if (saved) {
      setTimeout(() => {
        this.api.setImageTransform(
          saved.scale,
          saved.x,
          saved.y,
          true
        );
      }, 100);
    }
  },

  beforeClose(event) {
    // Save current state
    const imageUrl = event.target.src;
    const state = this.api.getImageState();

    if (state) {
      this.saveState(imageUrl, state);
    }
  },

  loadState(url) {
    try {
      const data = localStorage.getItem(this.storageKey);
      const states = data ? JSON.parse(data) : {};
      return states[url];
    } catch (e) {
      return null;
    }
  },

  saveState(url, state) {
    try {
      const data = localStorage.getItem(this.storageKey);
      const states = data ? JSON.parse(data) : {};
      states[url] = state;
      localStorage.setItem(this.storageKey, JSON.stringify(states));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }
};

viewer.registerPlugin(statePlugin);
```

## Real-World Examples

### E-Commerce Product Gallery

```typescript
const productGallery = new zPhotoCarousel({
  el: '.product-image',
  min: 1,
  max: 6,
  enableThumbnails: true,
  thumbnailHeight: 80,
  thumbnailPosition: 'bottom',
  transition: 'fade'
});

// Add to cart from viewer
const addToCartPlugin = {
  name: 'add-to-cart',

  afterOpen(event) {
    const container = api.getPreviewContainer();

    const button = document.createElement('button');
    button.className = 'add-to-cart-btn';
    button.textContent = 'Add to Cart';
    button.style.cssText = `
      position: absolute;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      z-index: 1001;
    `;

    button.addEventListener('click', () => {
      addToCart(productId);
      showNotification('Added to cart!');
    });

    container.appendChild(button);
  }
};

productGallery.registerPlugin(addToCartPlugin);
```

### Photography Portfolio

```typescript
const portfolio = new zPhotoCarousel({
  el: '.portfolio-image',
  min: 0.5,
  max: 10,
  enableThumbnails: true,
  thumbnailHeight: 150,
  enableKeyboard: true,
  transition: 'slide'
});

// Track which images users view
portfolio.onSlideChange((event) => {
  const image = event.instance.getImages()[event.index];

  // Analytics
  analytics.track('Portfolio Image Viewed', {
    index: event.index,
    title: image.alt,
    url: image.src
  });
});

// Share button
const sharePlugin = {
  name: 'share',

  afterOpen(event) {
    const container = api.getPreviewContainer();

    const shareBtn = document.createElement('button');
    shareBtn.textContent = '📤 Share';
    shareBtn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 80px;
      padding: 10px 20px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      z-index: 1001;
    `;

    shareBtn.addEventListener('click', async () => {
      const url = event.target.src;

      if (navigator.share) {
        await navigator.share({
          title: 'Check out this photo',
          url: url
        });
      } else {
        navigator.clipboard.writeText(url);
        alert('URL copied to clipboard!');
      }
    });

    container.appendChild(shareBtn);
  }
};

portfolio.registerPlugin(sharePlugin);
```

### Image Comparison Tool

```typescript
const comparisonViewer = new zPhotoCarousel({
  el: '.comparison-image',
  min: 0.5,
  max: 8,
  enableThumbnails: true
});

// Synchronize zoom across images
const syncZoomPlugin = {
  name: 'sync-zoom',
  lastState: null,

  initialize(instance, api) {
    this.api = api;
  },

  afterOpen(event) {
    // Restore last zoom level
    if (this.lastState) {
      setTimeout(() => {
        this.api.setImageTransform(
          this.lastState.scale,
          this.lastState.x,
          this.lastState.y,
          false
        );
      }, 100);
    }

    // Track state changes
    setInterval(() => {
      this.lastState = this.api.getImageState();
    }, 100);
  }
};

comparisonViewer.registerPlugin(syncZoomPlugin);
```

### Documentation/Manual Viewer

```typescript
const manualViewer = new zPhotoCarousel({
  el: '.manual-page',
  min: 0.5,
  max: 15,  // High zoom for reading text
  enableThumbnails: true,
  thumbnailHeight: 100,
  enableKeyboard: true
});

// Page navigation
manualViewer.onSlideChange((event) => {
  // Update page counter
  document.querySelector('.page-number').textContent =
    `Page ${event.index + 1} of ${event.total}`;

  // Update URL without reload
  history.pushState(null, '', `?page=${event.index + 1}`);
});

// Load page from URL
const urlParams = new URLSearchParams(window.location.search);
const page = parseInt(urlParams.get('page') || '1') - 1;

if (page > 0) {
  // Open to specific page
  setTimeout(() => {
    manualViewer.goTo(page);
  }, 100);
}
```

## TypeScript Examples

### Fully Typed Implementation

```typescript
import {
  zPhotoCarousel,
  CarouselOptions,
  NavigateEvent,
  SlideChangeEvent,
  ZPhotoZoomPlugin,
  PluginAPI
} from 'zphotozoom';

// Typed options
const options: CarouselOptions = {
  el: '.gallery img',
  min: 0.5,
  max: 8,
  enableThumbnails: true,
  thumbnailHeight: 120
};

// Create instance
const carousel = new zPhotoCarousel(options);

// Typed event handlers
carousel.onNavigate((event: NavigateEvent) => {
  console.log(`From ${event.from} to ${event.to}`);
});

carousel.onSlideChange((event: SlideChangeEvent) => {
  console.log(`Image ${event.index + 1} of ${event.total}`);
});

// Typed plugin
const myPlugin: ZPhotoZoomPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  initialize(instance: zPhotoCarousel, api: PluginAPI): void {
    console.log('Plugin initialized');
  },

  afterOpen(event: PluginEvent): void {
    console.log('Viewer opened');
  }
};

carousel.registerPlugin(myPlugin);
```

## Next Steps

- [Core API Reference](./core-api.md) - Detailed API documentation
- [Carousel API Reference](./carousel-api.md) - Carousel features
- [Plugin System](./plugin-system.md) - Create custom plugins
- [Getting Started](./getting-started.md) - Installation and setup

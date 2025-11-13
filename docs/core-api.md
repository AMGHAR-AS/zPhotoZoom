# Core API Reference

## Constructor

### `new zPhotoZoom(options, context?)`

Creates a new image zoom viewer instance.

```typescript
constructor(options?: zPhotoZoomOptions, context?: Document)
```

**Parameters:**
- `options` (optional): Configuration options
- `context` (optional): Document context (default: `document`)

**Example:**

```typescript
const viewer = new zPhotoZoom({
  el: '.zoomable',
  min: 0.5,
  max: 5
});
```

## Options

### zPhotoZoomOptions

```typescript
interface zPhotoZoomOptions {
  el: string;
  container?: HTMLElement;
  min?: number;
  max?: number;
}
```

#### `el` (required)

CSS selector for target images.

```typescript
el: string
```

**Example:**

```typescript
// Single class
el: '.zoomable'

// Multiple selectors
el: '.gallery img'

// ID selector
el: '#main-image'
```

#### `container` (optional)

Container element for embedded mode. If provided, the viewer will be constrained to this container instead of fullscreen.

```typescript
container?: HTMLElement
```

**Example:**

```typescript
const container = document.getElementById('viewer-container');

const viewer = new zPhotoZoom({
  el: '.product-image',
  container: container
});
```

#### `min` (optional)

Minimum zoom scale limit.

```typescript
min?: number  // Default: 0.3
```

**Example:**

```typescript
// Allow zooming out to 30% of original size
min: 0.3

// Prevent zooming out below original size
min: 1
```

#### `max` (optional)

Maximum zoom scale limit.

```typescript
max?: number  // Default: 5
```

**Example:**

```typescript
// Allow zooming in to 500% of original size
max: 5

// Allow extreme zoom for detailed images
max: 20
```

## Methods

### `onOpen(callback, remove?)`

Register a callback when the viewer opens.

```typescript
onOpen(callback: ViewerEventCallback, remove?: boolean): void
```

**Parameters:**
- `callback`: Function to call when viewer opens
- `remove` (optional): If `true`, removes the callback instead

**Callback Parameters:**

```typescript
interface ViewerEvent {
  preventDefault: () => void;
  stopPropagation: () => void;
  target: HTMLElement;
  instance: zPhotoZoom;
}
```

**Example:**

```typescript
viewer.onOpen((event) => {
  console.log('Viewer opened for:', event.target);

  // Prevent opening in certain conditions
  if (shouldPreventOpen()) {
    event.preventDefault();
  }
});

// Remove callback
viewer.onOpen(myCallback, true);
```

### `onClose(callback, remove?)`

Register a callback when the viewer closes.

```typescript
onClose(callback: ViewerEventCallback, remove?: boolean): void
```

**Example:**

```typescript
viewer.onClose((event) => {
  console.log('Viewer closed');

  // Perform cleanup
  cleanup();
});
```

### `stop()`

Stops all interactions (zoom, pan, etc.).

```typescript
stop(): void
```

**Example:**

```typescript
// Disable interactions during video playback
video.addEventListener('play', () => {
  viewer.stop();
});
```

### `resume()`

Resumes interactions after being stopped.

```typescript
resume(): void
```

**Example:**

```typescript
video.addEventListener('pause', () => {
  viewer.resume();
});
```

### `reset()`

Resets the current image to its original centered state.

```typescript
reset(): void
```

**Example:**

```typescript
document.querySelector('.reset-btn').addEventListener('click', () => {
  viewer.reset();
});
```

### `close()`

Closes the viewer if currently open.

```typescript
close(): void
```

**Example:**

```typescript
document.querySelector('.close-btn').addEventListener('click', () => {
  viewer.close();
});
```

### `update()`

Forces an update of the image scale and position.

```typescript
update(): void
```

**Example:**

```typescript
// After modifying image properties
viewer.update();
```

### `change(selector)`

Changes the target selector and reinitializes images.

```typescript
change(selector: string): void
```

**Example:**

```typescript
// Initially target .old-images
const viewer = new zPhotoZoom({ el: '.old-images' });

// Switch to new images
viewer.change('.new-images');
```

## Events

### ViewerEvent

All event callbacks receive a `ViewerEvent` object:

```typescript
interface ViewerEvent {
  preventDefault: () => void;
  stopPropagation: () => void;
  target: HTMLElement;
  instance: zPhotoZoom;
}
```

**Properties:**

- `preventDefault()`: Prevents the default action (opening/closing)
- `stopPropagation()`: Stops event propagation
- `target`: The HTML element that triggered the event
- `instance`: Reference to the zPhotoZoom instance

**Example:**

```typescript
viewer.onOpen((event) => {
  console.log('Target:', event.target);
  console.log('Instance:', event.instance);

  // Conditional prevention
  if (someCondition) {
    event.preventDefault();
  }
});
```

## Usage Patterns

### Programmatic Control

```typescript
const viewer = new zPhotoZoom({ el: '.image' });

// Control buttons
document.querySelector('.btn-stop').addEventListener('click', () => {
  viewer.stop();
});

document.querySelector('.btn-resume').addEventListener('click', () => {
  viewer.resume();
});

document.querySelector('.btn-reset').addEventListener('click', () => {
  viewer.reset();
});

document.querySelector('.btn-close').addEventListener('click', () => {
  viewer.close();
});
```

### Event Tracking

```typescript
const viewer = new zPhotoZoom({ el: '.image' });

viewer.onOpen((event) => {
  analytics.track('Image Viewed', {
    imageUrl: event.target.src,
    timestamp: Date.now()
  });
});

viewer.onClose((event) => {
  analytics.track('Viewer Closed', {
    timestamp: Date.now()
  });
});
```

### Dynamic Images

```typescript
const viewer = new zPhotoZoom({ el: '.dynamic-image' });

// Load new images
fetch('/api/images')
  .then(response => response.json())
  .then(images => {
    const container = document.querySelector('.gallery');

    images.forEach(img => {
      const element = document.createElement('img');
      element.src = img.url;
      element.className = 'dynamic-image';
      container.appendChild(element);
    });

    // Reinitialize with new images
    viewer.change('.dynamic-image');
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

### Embedded Mode

```typescript
const container = document.getElementById('viewer-container');

const viewer = new zPhotoZoom({
  el: '.product-image',
  container: container,
  min: 0.8,
  max: 4
});
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import zPhotoZoom, {
  zPhotoZoomOptions,
  ViewerEvent,
  ViewerEventCallback
} from 'zphotozoom';

const options: zPhotoZoomOptions = {
  el: '.gallery-image',
  min: 0.3,
  max: 10
};

const viewer = new zPhotoZoom(options);

viewer.onOpen((event: ViewerEvent) => {
  console.log('Image opened:', event.target);
});
```

## Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- iOS Safari: 12+
- Chrome Android: Last 2 versions

## Performance Tips

### GPU Acceleration

The library automatically uses GPU-accelerated transforms (`transform3d`, `translate3d`) for smooth 60fps animations.

### Large Images

For very large images (> 5MB), consider:

1. Using progressive JPEGs
2. Implementing lazy loading
3. Serving appropriately sized images

### Multiple Instances

Each instance manages its own state independently. Use multiple instances cautiously as each adds event listeners.

## Next Steps

- [Carousel API Reference](./carousel-api.md) - Multi-image navigation
- [Plugin System](./plugin-system.md) - Extend functionality
- [Examples](./examples.md) - More usage examples

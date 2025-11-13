# Getting Started with zPhotoZoom

## Installation

### NPM

```bash
npm install zphotozoom
```

### Yarn

```bash
yarn add zphotozoom
```

### CDN

```html
<script src="https://unpkg.com/zphotozoom@latest/dist/zphotozoom.umd.js"></script>
```

## Basic Usage

### Single Image Viewer

The simplest way to add zoom functionality to an image:

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

### Multiple Images Gallery

```html
<div class="gallery">
  <img src="photo1.jpg" class="zoomable" alt="Photo 1">
  <img src="photo2.jpg" class="zoomable" alt="Photo 2">
  <img src="photo3.jpg" class="zoomable" alt="Photo 3">
</div>

<script type="module">
  import zPhotoZoom from 'zphotozoom';

  const viewer = new zPhotoZoom({
    el: '.zoomable'
  });
</script>
```

### Carousel Mode

For multi-image navigation with thumbnails:

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
```

## Configuration Options

### Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `el` | `string` | required | CSS selector for target images |
| `container` | `HTMLElement` | `undefined` | Optional container for embedded mode |
| `min` | `number` | `0.3` | Minimum zoom scale limit |
| `max` | `number` | `5` | Maximum zoom scale limit |

### Carousel Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableThumbnails` | `boolean` | `true` | Show thumbnail bar |
| `thumbnailHeight` | `number` | `120` | Thumbnail bar height in pixels |
| `thumbnailPosition` | `'top'\|'bottom'\|'left'\|'right'` | `'bottom'` | Position of thumbnail bar |
| `enableKeyboard` | `boolean` | `true` | Enable keyboard shortcuts |
| `enableArrows` | `boolean` | `true` | Show navigation arrows |
| `transition` | `'slide'\|'fade'\|'none'` | `'slide'` | Animation type |

## Controls

### Mouse/Trackpad
- **Click**: Open image viewer
- **Wheel**: Zoom in/out
- **Drag**: Pan image when zoomed
- **Click background**: Close viewer

### Touch (Mobile)
- **Tap**: Open image viewer
- **Pinch**: Zoom in/out
- **Drag**: Pan image when zoomed
- **Swipe**: Navigate between images (carousel mode)

### Keyboard (Carousel Mode)
- **←/→**: Navigate previous/next
- **Home**: Jump to first image
- **End**: Jump to last image
- **Escape**: Close viewer

## Next Steps

- [Core API Reference](./core-api.md) - Detailed API documentation for core viewer
- [Carousel API Reference](./carousel-api.md) - Carousel-specific features
- [Plugin System](./plugin-system.md) - Extend functionality with plugins
- [Examples](./examples.md) - More usage examples

## Troubleshooting

### Images not responding to clicks

Make sure your selector is correct and the images are loaded:

```javascript
const viewer = new zPhotoZoom({
  el: '.gallery img'  // Make sure this matches your images
});
```

### Zoom not working

Check that `min` and `max` values are properly configured:

```javascript
const viewer = new zPhotoZoom({
  el: '.image',
  min: 0.3,  // Allow zooming out to 30%
  max: 5     // Allow zooming in to 500%
});
```

### Carousel images not centering properly

This is fixed in version 2.0.4+. Make sure you're using the latest version:

```bash
npm update zphotozoom
```

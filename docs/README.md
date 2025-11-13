# zPhotoZoom Documentation

Complete documentation for zPhotoZoom - a modern TypeScript library for interactive image zoom viewers with carousel support.

## Table of Contents

### Getting Started
- **[Getting Started Guide](./getting-started.md)** - Installation, basic usage, and configuration
  - Installation options (NPM, Yarn, CDN)
  - Quick start examples
  - Controls overview
  - Troubleshooting

### API Documentation
- **[Core API Reference](./core-api.md)** - Complete API for the base viewer
  - Constructor and options
  - Methods (stop, resume, reset, close, etc.)
  - Event handlers (onOpen, onClose)
  - Usage patterns
  - TypeScript support

- **[Carousel API Reference](./carousel-api.md)** - Multi-image navigation features
  - Carousel options
  - Navigation methods (next, previous, goTo)
  - State management
  - Event handlers (onNavigate, onSlideChange)
  - State persistence
  - CSS customization

### Extensibility
- **[Plugin System](./plugin-system.md)** - Extend functionality with plugins
  - Plugin interface
  - Lifecycle hooks
  - Plugin API methods
  - Creating custom plugins
  - Best practices

### Examples
- **[Usage Examples](./examples.md)** - Comprehensive code examples
  - Basic examples
  - Carousel examples
  - Plugin examples
  - Advanced examples
  - Real-world examples
  - TypeScript examples

## Quick Links

### Installation

```bash
npm install zphotozoom
```

### Basic Usage

```typescript
import zPhotoZoom from 'zphotozoom';

const viewer = new zPhotoZoom({
  el: '.zoomable',
  min: 0.5,
  max: 5
});
```

### Carousel Usage

```typescript
import { zPhotoCarousel } from 'zphotozoom';

const carousel = new zPhotoCarousel({
  el: '.gallery img',
  enableThumbnails: true,
  enableKeyboard: true
});
```

## Features

### Core Features
- 🖱️ Mouse wheel zoom
- 👆 Touch gestures (pinch-to-zoom, drag-to-pan)
- 📱 Responsive design
- ⚡ GPU-accelerated performance
- 🎨 Customizable
- 📦 Lightweight (~15KB core)
- 🔧 TypeScript support
- 🎯 Zero dependencies

### Carousel Features
- 🎠 Multi-image navigation
- 🖼️ Thumbnail bar
- ⌨️ Keyboard shortcuts
- 📱 Touch swipe support
- 🔄 State persistence
- 🎬 Smooth transitions
- 🔢 Image counter
- 🔌 Plugin system

## Documentation Structure

```
docs/
├── README.md                  # This file
├── getting-started.md         # Installation and basics
├── core-api.md               # Core viewer API reference
├── carousel-api.md           # Carousel API reference
├── plugin-system.md          # Plugin development guide
└── examples.md               # Code examples
```

## Support

- **GitHub**: [github.com/AMGHAR-AS/zPhotoZoom](https://github.com/AMGHAR-AS/zPhotoZoom)
- **Issues**: [Report a bug](https://github.com/AMGHAR-AS/zPhotoZoom/issues)
- **NPM**: [npmjs.com/package/zphotozoom](https://www.npmjs.com/package/zphotozoom)

## License

MIT License - see [LICENSE](../LICENSE) file for details.

## Version

Current version: 2.0.4

## Author

AMGHAR Abdeslam

---

Made with ❤️ by AMGHAR Abdeslam

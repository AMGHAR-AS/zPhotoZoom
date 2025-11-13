# Plugin System

The plugin system allows you to extend zPhotoZoom's functionality without modifying the core library.

## Overview

Plugins can:
- Hook into lifecycle events (beforeOpen, afterOpen, beforeClose, afterClose)
- Access internal state via a safe API
- Manipulate image transformations
- Add custom UI elements
- Track analytics
- Implement custom behaviors

## Plugin Interface

### Basic Plugin Structure

```typescript
interface ZPhotoZoomPlugin {
  readonly name: string;
  readonly version?: string;

  initialize(instance: zPhotoZoom, api: PluginAPI): void;
  destroy?(): void;

  // Lifecycle hooks
  beforeOpen?(event: PluginEvent): void;
  afterOpen?(event: PluginEvent): void;
  beforeClose?(event: PluginEvent): void;
  afterClose?(event: PluginEvent): void;
}
```

### Plugin API

The PluginAPI provides safe access to internal functionality:

```typescript
interface PluginAPI {
  getImageState(): ImageState | null;
  setImageTransform(scale: number, x: number, y: number, animate?: boolean): void;
  centerImage(options?: CenterImageOptions): void;
  resetImage(): void;
  getCurrentImageElement(): HTMLImageElement | null;
  getPreviewContainer(): HTMLElement | null;
  isViewerOpen(): boolean;
  closeViewer(): void;
}
```

## Creating a Plugin

### Example: Analytics Plugin

```typescript
const analyticsPlugin: ZPhotoZoomPlugin = {
  name: 'analytics',
  version: '1.0.0',

  initialize(instance, api) {
    console.log('Analytics plugin initialized');
  },

  afterOpen(event) {
    // Track when image is opened
    analytics.track('Image Opened', {
      imageUrl: event.target.src,
      timestamp: Date.now()
    });
  },

  afterClose(event) {
    // Track when viewer is closed
    analytics.track('Viewer Closed', {
      timestamp: Date.now()
    });
  }
};

// Register the plugin
viewer.registerPlugin(analyticsPlugin);
```

### Example: Auto-Reset Plugin

```typescript
const autoResetPlugin: ZPhotoZoomPlugin = {
  name: 'auto-reset',
  version: '1.0.0',

  private timer: number | null = null,
  private api: PluginAPI | null = null,

  initialize(instance, api) {
    this.api = api;
  },

  afterOpen(event) {
    // Auto-reset after 5 seconds of inactivity
    this.resetTimer();
  },

  beforeClose(event) {
    // Clear timer when closing
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },

  resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      if (this.api && this.api.isViewerOpen()) {
        this.api.resetImage();
      }
    }, 5000);
  },

  destroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
};

viewer.registerPlugin(autoResetPlugin);
```

### Example: Watermark Plugin

```typescript
const watermarkPlugin: ZPhotoZoomPlugin = {
  name: 'watermark',
  version: '1.0.0',

  private watermark: HTMLElement | null = null,

  initialize(instance, api) {
    this.api = api;
  },

  afterOpen(event) {
    const container = this.api!.getPreviewContainer();
    if (!container) return;

    // Create watermark element
    this.watermark = document.createElement('div');
    this.watermark.className = 'zpz-watermark';
    this.watermark.textContent = '© Your Company';
    this.watermark.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
      pointer-events: none;
      z-index: 1000;
    `;

    container.appendChild(this.watermark);
  },

  beforeClose(event) {
    if (this.watermark && this.watermark.parentNode) {
      this.watermark.parentNode.removeChild(this.watermark);
      this.watermark = null;
    }
  },

  destroy() {
    if (this.watermark && this.watermark.parentNode) {
      this.watermark.parentNode.removeChild(this.watermark);
    }
  }
};

viewer.registerPlugin(watermarkPlugin);
```

### Example: Zoom Limits Plugin

```typescript
const zoomLimitsPlugin: ZPhotoZoomPlugin = {
  name: 'zoom-limits',
  version: '1.0.0',

  private api: PluginAPI | null = null,

  initialize(instance, api) {
    this.api = api;

    // Monitor zoom changes
    setInterval(() => {
      const state = api.getImageState();
      if (state && state.scale > 3) {
        console.warn('Zoom level too high!');
        // Optionally reset to safe level
        // api.setImageTransform(3, state.x, state.y, true);
      }
    }, 100);
  }
};

viewer.registerPlugin(zoomLimitsPlugin);
```

## Lifecycle Hooks

### beforeOpen(event)

Called before the viewer opens. Can prevent opening by calling `event.preventDefault()`.

```typescript
beforeOpen(event: PluginEvent) {
  // Check conditions
  if (shouldPreventOpen()) {
    event.preventDefault();
  }
}
```

### afterOpen(event)

Called after the viewer has opened and initialized.

```typescript
afterOpen(event: PluginEvent) {
  console.log('Viewer is now open');
  // Add custom UI, start tracking, etc.
}
```

### beforeClose(event)

Called before the viewer closes. Can prevent closing by calling `event.preventDefault()`.

```typescript
beforeClose(event: PluginEvent) {
  // Confirm with user
  if (!confirm('Close viewer?')) {
    event.preventDefault();
  }
}
```

### afterClose(event)

Called after the viewer has closed.

```typescript
afterClose(event: PluginEvent) {
  console.log('Viewer is now closed');
  // Cleanup, save state, etc.
}
```

## Plugin Event

All lifecycle hooks receive a `PluginEvent`:

```typescript
interface PluginEvent {
  preventDefault: () => void;
  stopPropagation: () => void;
  target: HTMLElement;
  instance: zPhotoZoom;
}
```

## Plugin API Methods

### getImageState()

Get current image state (scale, position).

```typescript
const state = api.getImageState();
if (state) {
  console.log('Scale:', state.scale);
  console.log('Position:', state.x, state.y);
}
```

### setImageTransform()

Apply a transform to the current image.

```typescript
// Zoom to 2x at position (100, 100) with animation
api.setImageTransform(2, 100, 100, true);
```

### centerImage()

Center the image with optional configuration.

```typescript
// Center with margins
api.centerImage({
  marginPercent: 0.1,  // 10% margin
  allowUpscale: false
});

// Center with reserved spaces (for UI elements)
api.centerImage({
  reservedSpaces: {
    bottom: 120  // Reserve 120px at bottom for thumbnails
  }
});
```

### resetImage()

Reset image to original centered state.

```typescript
api.resetImage();
```

### getCurrentImageElement()

Get the current image HTML element.

```typescript
const img = api.getCurrentImageElement();
if (img) {
  console.log('Image dimensions:', img.width, img.height);
}
```

### getPreviewContainer()

Get the preview container element.

```typescript
const container = api.getPreviewContainer();
if (container) {
  // Add custom elements
  container.appendChild(myElement);
}
```

### isViewerOpen()

Check if viewer is currently open.

```typescript
if (api.isViewerOpen()) {
  console.log('Viewer is open');
}
```

### closeViewer()

Programmatically close the viewer.

```typescript
api.closeViewer();
```

## Advanced Plugins

### Multi-Hook Plugin

```typescript
const advancedPlugin: ZPhotoZoomPlugin = {
  name: 'advanced-plugin',
  version: '2.0.0',

  private startTime: number = 0,
  private api: PluginAPI | null = null,

  initialize(instance, api) {
    this.api = api;
    console.log('Plugin initialized');
  },

  beforeOpen(event) {
    console.log('About to open viewer...');
    this.startTime = Date.now();
  },

  afterOpen(event) {
    const loadTime = Date.now() - this.startTime;
    console.log(`Viewer opened in ${loadTime}ms`);

    // Track performance
    analytics.timing('viewer_open', loadTime);
  },

  beforeClose(event) {
    const state = this.api!.getImageState();
    if (state && state.scale > 1) {
      // Warn if user is zoomed in
      if (!confirm('You are zoomed in. Close anyway?')) {
        event.preventDefault();
      }
    }
  },

  afterClose(event) {
    console.log('Viewer closed');
    this.startTime = 0;
  },

  destroy() {
    console.log('Plugin destroyed');
  }
};

viewer.registerPlugin(advancedPlugin);
```

### State Management Plugin

```typescript
const stateManagerPlugin: ZPhotoZoomPlugin = {
  name: 'state-manager',
  version: '1.0.0',

  private savedStates: Map<string, ImageState> = new Map(),
  private api: PluginAPI | null = null,

  initialize(instance, api) {
    this.api = api;
  },

  afterOpen(event) {
    // Try to restore saved state
    const imageUrl = event.target.src;
    const savedState = this.savedStates.get(imageUrl);

    if (savedState) {
      setTimeout(() => {
        this.api!.setImageTransform(
          savedState.scale,
          savedState.x,
          savedState.y,
          true
        );
      }, 100);
    }
  },

  beforeClose(event) {
    // Save current state
    const imageUrl = event.target.src;
    const state = this.api!.getImageState();

    if (state) {
      this.savedStates.set(imageUrl, state);
    }
  },

  destroy() {
    this.savedStates.clear();
  }
};

viewer.registerPlugin(stateManagerPlugin);
```

## Plugin Registration

### Register Single Plugin

```typescript
viewer.registerPlugin(myPlugin);
```

### Register Multiple Plugins

```typescript
const plugins = [
  analyticsPlugin,
  watermarkPlugin,
  autoResetPlugin
];

plugins.forEach(plugin => {
  viewer.registerPlugin(plugin);
});
```

### Conditional Registration

```typescript
// Only in production
if (process.env.NODE_ENV === 'production') {
  viewer.registerPlugin(analyticsPlugin);
}

// Only for premium users
if (user.isPremium) {
  viewer.registerPlugin(premiumFeaturesPlugin);
}
```

## Best Practices

### 1. Clean Up Resources

Always implement `destroy()` to clean up:

```typescript
destroy() {
  // Clear timers
  if (this.timer) {
    clearTimeout(this.timer);
  }

  // Remove event listeners
  if (this.element) {
    this.element.removeEventListener('click', this.handler);
  }

  // Clear references
  this.api = null;
}
```

### 2. Handle Missing API

Always check if API methods return values:

```typescript
const state = api.getImageState();
if (!state) {
  console.warn('No image state available');
  return;
}
```

### 3. Use Versioning

Include version numbers for compatibility tracking:

```typescript
const myPlugin: ZPhotoZoomPlugin = {
  name: 'my-plugin',
  version: '1.2.3',
  // ...
};
```

### 4. Avoid Blocking Operations

Don't block the main thread in hooks:

```typescript
afterOpen(event) {
  // Bad: Synchronous heavy operation
  // processLargeData();

  // Good: Async operation
  setTimeout(() => processLargeData(), 0);
}
```

### 5. Error Handling

Wrap operations in try-catch:

```typescript
afterOpen(event) {
  try {
    this.doSomething();
  } catch (error) {
    console.error('Plugin error:', error);
  }
}
```

## TypeScript Support

Full type definitions included:

```typescript
import {
  ZPhotoZoomPlugin,
  PluginAPI,
  PluginEvent,
  ImageState
} from 'zphotozoom';

const myPlugin: ZPhotoZoomPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  initialize(instance: zPhotoZoom, api: PluginAPI): void {
    // TypeScript will provide full autocomplete
    const state: ImageState | null = api.getImageState();
  },

  afterOpen(event: PluginEvent): void {
    // Full type safety
  }
};
```

## Debugging Plugins

### Enable Plugin Logging

```typescript
const debugPlugin: ZPhotoZoomPlugin = {
  name: 'debug',
  version: '1.0.0',

  initialize(instance, api) {
    console.log('[DEBUG] Plugin initialized');
  },

  beforeOpen(event) {
    console.log('[DEBUG] beforeOpen', event);
  },

  afterOpen(event) {
    console.log('[DEBUG] afterOpen', event);
    console.log('[DEBUG] Image state:', api.getImageState());
  },

  beforeClose(event) {
    console.log('[DEBUG] beforeClose', event);
  },

  afterClose(event) {
    console.log('[DEBUG] afterClose', event);
  }
};
```

## Next Steps

- [Core API](./core-api.md) - Base viewer API
- [Carousel API](./carousel-api.md) - Carousel-specific features
- [Examples](./examples.md) - More usage examples

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Keyboard navigation support
- ARIA attributes for accessibility
- Double-tap to zoom on mobile
- Image rotation support
- Gallery navigation (prev/next buttons)
- Thumbnail strip in viewer

## [2.0.0] - 2025-01-15

### Added
- Complete TypeScript rewrite with full type safety
- Integrated CSS styles (no external CSS file needed)
- Comprehensive JSDoc documentation throughout codebase
- Modern ES6+ features (arrow functions, const/let, template literals)
- Class-based architecture replacing function constructors
- Private/public method distinction for better encapsulation
- Detailed development notes and migration guide
- Type definitions for all interfaces and data structures
- Automatic CSS injection on first instantiation

### Changed
- **BREAKING**: Must use `new` keyword when instantiating (enforced by TypeScript class)
- Modernized codebase to ES2020 standards
- Improved code organization with logical section grouping
- Enhanced event handling with proper cleanup
- Better error handling and type safety throughout
- Optimized transform calculations for performance
- Updated method signatures with explicit types

### Removed
- Removed all `var` declarations in favor of `const`/`let`
- Removed external CSS file dependency
- Removed implicit type coercions

### Fixed
- Fixed potential memory leaks in event listeners
- Fixed type safety issues in event handlers
- Improved resize handling logic
- Better touch event handling on mobile devices

### Security
- Eliminated potential XSS vulnerabilities
- Safe URL parsing for background images
- No eval() or Function() usage

## [1.0.0] - 2022-02-01

### Added
- Initial release
- Full-screen image zoom viewer
- Mouse wheel zoom support
- Touch gestures (pinch-to-zoom, drag-to-pan)
- Support for `<img>` elements and CSS background images
- Configurable zoom scale limits
- Event hooks (onOpen, onClose)
- Responsive design with window resize handling
- Loading indicators with zoom percentage display
- Optional container mode for embedded viewers

### Features
- Lightweight (~15KB minified + gzipped)
- Zero dependencies
- Smooth 60fps animations
- GPU-accelerated transforms
- Mobile-friendly touch interactions

## Migration Guides

### Migrating from 1.x to 2.x

#### Breaking Changes

1. **Constructor Usage**
   ```javascript
   // Old (1.x)
   const viewer = zPhotoZoom({ el: '.image' });
   
   // New (2.x) - Must use 'new' keyword
   const viewer = new zPhotoZoom({ el: '.image' });
   ```

2. **TypeScript Types**
   ```typescript
   // If using TypeScript, import types
   import zPhotoZoom, { zPhotoZoomOptions, ViewerEvent } from 'zphotozoom';
   ```

3. **CSS Loading**
   ```html
   <!-- Remove this line - CSS is now automatic -->
   <!-- <link rel="stylesheet" href="styles.css"> -->
   ```

#### Non-Breaking Changes
- All public API methods remain the same
- Event callback signatures unchanged
- Configuration options fully compatible
- Existing usage patterns continue to work

#### Recommended Updates

1. **Update imports**
   ```typescript
   // Add type imports if using TypeScript
   import zPhotoZoom, { PhotoZoomOptions } from 'zphotozoom';
   ```

2. **Add type annotations**
   ```typescript
   const options: PhotoZoomOptions = {
     el: '.image',
     min: 0.5,
     max: 5
   };
   ```

3. **Use modern syntax**
   ```typescript
   // Before
   viewer.onOpen(function(event) {
     console.log(event.target);
   });
   
   // After
   viewer.onOpen((event) => {
     console.log(event.target);
   });
   ```

## Version History Summary

- **2.0.0** - TypeScript rewrite with integrated CSS and modern architecture
- **1.0.0** - Initial JavaScript release with core functionality

## Links

- [GitHub Repository](https://github.com/AMGHAR-AS/zPhotoZoom)
- [npm Package](https://www.npmjs.com/package/zphotozoom)
- [Documentation](https://github.com/AMGHAR-AS/zPhotoZoom#readme)
- [Issues](https://github.com/AMGHAR-AS/zPhotoZoom/issues)

---

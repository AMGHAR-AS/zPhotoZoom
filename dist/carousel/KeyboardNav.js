/**
 * Keyboard Navigation Component for zPhotoZoom Carousel
 *
 * @module carousel/KeyboardNav
 * @license MIT
 */
/**
 * Keyboard mappings for carousel navigation
 */
const KEYBOARD_MAPPINGS = {
    ArrowLeft: 'previous',
    ArrowRight: 'next',
    Escape: 'close',
    Home: 'first',
    End: 'last',
    Space: 'togglePlay'
};
/**
 * KeyboardNav - Manages keyboard shortcuts for carousel navigation
 *
 * @example
 * ```typescript
 * const keyboardNav = new KeyboardNav({
 *   onNext: () => carousel.next(),
 *   onPrevious: () => carousel.previous(),
 *   onClose: () => carousel.close(),
 *   onFirst: () => carousel.first(),
 *   onLast: () => carousel.last(),
 *   enabled: true
 * });
 * ```
 */
export class KeyboardNav {
    constructor(options) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "enabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "boundHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.options = options;
        this.enabled = options.enabled;
        if (this.enabled) {
            this.enable();
        }
    }
    /**
     * Enable keyboard navigation
     */
    enable() {
        if (this.enabled && this.boundHandler) {
            return; // Already enabled
        }
        this.enabled = true;
        this.boundHandler = this.handleKeyDown.bind(this);
        document.addEventListener('keydown', this.boundHandler);
    }
    /**
     * Disable keyboard navigation
     */
    disable() {
        if (!this.enabled || !this.boundHandler) {
            return; // Already disabled
        }
        this.enabled = false;
        document.removeEventListener('keydown', this.boundHandler);
        this.boundHandler = null;
    }
    /**
     * Destroy the keyboard navigation (cleanup)
     */
    destroy() {
        this.disable();
    }
    /**
     * Handle keyboard events
     */
    handleKeyDown(e) {
        if (!this.enabled) {
            return;
        }
        // Check if user is typing in an input/textarea
        const target = e.target;
        if (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable) {
            return;
        }
        const action = KEYBOARD_MAPPINGS[e.key];
        if (!action) {
            return; // Key not mapped
        }
        // Prevent default browser behavior for mapped keys
        e.preventDefault();
        e.stopPropagation();
        // Execute corresponding action
        switch (action) {
            case 'next':
                this.options.onNext();
                break;
            case 'previous':
                this.options.onPrevious();
                break;
            case 'close':
                this.options.onClose();
                break;
            case 'first':
                this.options.onFirst();
                break;
            case 'last':
                this.options.onLast();
                break;
            case 'togglePlay':
                if (this.options.onTogglePlay) {
                    this.options.onTogglePlay();
                }
                break;
        }
    }
}
//# sourceMappingURL=KeyboardNav.js.map
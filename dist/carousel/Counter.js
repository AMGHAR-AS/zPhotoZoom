/**
 * Counter Component for zPhotoZoom Carousel
 *
 * @module carousel/Counter
 * @license MIT
 */
/**
 * Counter - Displays current image number and total count
 *
 * @example
 * ```typescript
 * const counter = new Counter('top-right');
 * const counterElement = counter.render();
 * container.appendChild(counterElement);
 * counter.update(3, 12); // Shows "3 / 12"
 * ```
 */
export class Counter {
    constructor(position = 'top-right') {
        Object.defineProperty(this, "position", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: position
        });
        Object.defineProperty(this, "container", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "currentSpan", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "totalSpan", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /**
     * Render the counter
     */
    render() {
        this.container = document.createElement('div');
        this.container.className = `zpz-counter zpz-counter-${this.position}`;
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-atomic', 'true');
        // Current number
        this.currentSpan = document.createElement('span');
        this.currentSpan.className = 'zpz-counter-current';
        this.currentSpan.textContent = '1';
        // Separator
        const separator = document.createElement('span');
        separator.className = 'zpz-counter-separator';
        separator.textContent = '/';
        // Total number
        this.totalSpan = document.createElement('span');
        this.totalSpan.className = 'zpz-counter-total';
        this.totalSpan.textContent = '1';
        this.container.appendChild(this.currentSpan);
        this.container.appendChild(separator);
        this.container.appendChild(this.totalSpan);
        return this.container;
    }
    /**
     * Update the counter display
     */
    update(current, total) {
        if (!this.currentSpan || !this.totalSpan) {
            return;
        }
        this.currentSpan.textContent = current.toString();
        this.totalSpan.textContent = total.toString();
        // Update aria-label for screen readers
        if (this.container) {
            this.container.setAttribute('aria-label', `Image ${current} of ${total}`);
        }
    }
    /**
     * Destroy the counter
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.currentSpan = null;
        this.totalSpan = null;
    }
}
//# sourceMappingURL=Counter.js.map
/**
 * Navigation Arrows Component for zPhotoZoom Carousel
 *
 * @module carousel/NavigationArrows
 * @license MIT
 */
/**
 * NavigationArrows - Prev/Next arrow buttons for carousel
 *
 * @example
 * ```typescript
 * const arrows = new NavigationArrows(
 *   () => carousel.previous(),
 *   () => carousel.next(),
 *   'center'
 * );
 *
 * const arrowsElement = arrows.render();
 * container.appendChild(arrowsElement);
 * ```
 */
export class NavigationArrows {
    constructor(onPrevious, onNext, position = 'center') {
        Object.defineProperty(this, "onPrevious", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onPrevious
        });
        Object.defineProperty(this, "onNext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: onNext
        });
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
        Object.defineProperty(this, "prevButton", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "nextButton", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /**
     * Render the navigation arrows
     */
    render() {
        this.container = document.createElement('div');
        this.container.className = `zpz-nav-arrows zpz-arrows-${this.position}`;
        // Create previous button
        this.prevButton = this.createArrowButton('prev', this.onPrevious);
        this.container.appendChild(this.prevButton);
        // Create next button
        this.nextButton = this.createArrowButton('next', this.onNext);
        this.container.appendChild(this.nextButton);
        return this.container;
    }
    /**
     * Create an arrow button
     */
    createArrowButton(direction, onClick) {
        const button = document.createElement('button');
        button.className = `zpz-arrow zpz-arrow-${direction}`;
        button.setAttribute('aria-label', direction === 'prev' ? 'Previous image' : 'Next image');
        button.type = 'button';
        // Add SVG icon
        const svg = this.createArrowIcon(direction);
        button.appendChild(svg);
        // Add click handler
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
        });
        return button;
    }
    /**
     * Create arrow SVG icon
     */
    createArrowIcon(direction) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (direction === 'prev') {
            // Left arrow
            path.setAttribute('d', 'M15 18l-6-6 6-6');
        }
        else {
            // Right arrow
            path.setAttribute('d', 'M9 18l6-6-6-6');
        }
        svg.appendChild(path);
        return svg;
    }
    /**
     * Update disabled state based on current position
     */
    updateDisabledState(currentIndex, totalImages, loop) {
        if (!this.prevButton || !this.nextButton) {
            return;
        }
        if (loop) {
            // Always enabled in loop mode
            this.prevButton.disabled = false;
            this.nextButton.disabled = false;
        }
        else {
            // Disable at boundaries
            this.prevButton.disabled = currentIndex === 0;
            this.nextButton.disabled = currentIndex === totalImages - 1;
        }
    }
    /**
     * Destroy the navigation arrows
     */
    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.prevButton = null;
        this.nextButton = null;
    }
}
//# sourceMappingURL=NavigationArrows.js.map
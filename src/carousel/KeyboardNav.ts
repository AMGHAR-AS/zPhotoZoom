/**
 * Keyboard Navigation Component for zPhotoZoom Carousel
 *
 * @module carousel/KeyboardNav
 * @license MIT
 */

import type { KeyboardNavOptions, IKeyboardNav } from './CarouselTypes';

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
} as const;

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
export class KeyboardNav implements IKeyboardNav {
  private options: KeyboardNavOptions;
  private enabled: boolean;
  private boundHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(options: KeyboardNavOptions) {
    this.options = options;
    this.enabled = options.enabled;

    if (this.enabled) {
      this.enable();
    }
  }

  /**
   * Enable keyboard navigation
   */
  public enable(): void {
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
  public disable(): void {
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
  public destroy(): void {
    this.disable();
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.enabled) {
      return;
    }

    // Check if user is typing in an input/textarea
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    const action = KEYBOARD_MAPPINGS[e.key as keyof typeof KEYBOARD_MAPPINGS];

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

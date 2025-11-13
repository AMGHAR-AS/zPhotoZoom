/**
 * Plugin System Types for zPhotoZoom
 *
 * @module PluginTypes
 * @license MIT
 */

import type zPhotoZoom from './zphotozoom';

/**
 * Image state snapshot for plugins
 */
export interface ImageState {
  scale: number;
  x: number;
  y: number;
  minScale: number;
  maxScale: number;
}

/**
 * Options for centering an image
 */
export interface CenterImageOptions {
  /** Reserved spaces (in pixels) that reduce available viewport area */
  reservedSpaces?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  /** Margin percentage (0-1) around the image. Default: 0.05 (5%) */
  marginPercent?: number;
  /** Whether to allow upscaling small images. Default: false */
  allowUpscale?: boolean;
}

/**
 * Plugin lifecycle hooks
 */
export interface ZPhotoZoomPluginHooks {
  /** Called when plugin is registered */
  onRegister?(): void;

  /** Called before viewer opens */
  beforeOpen?(event: PluginViewerEvent): void;

  /** Called after viewer opens */
  afterOpen?(event: PluginViewerEvent): void;

  /** Called before viewer closes */
  beforeClose?(event: PluginViewerEvent): void;

  /** Called after viewer closes */
  afterClose?(event: PluginViewerEvent): void;

  /** Called when image transform changes */
  onTransformChange?(state: ImageState): void;

  /** Called when plugin is unregistered */
  onDestroy?(): void;
}

/**
 * Plugin viewer event
 */
export interface PluginViewerEvent {
  target: HTMLElement;
  instance: zPhotoZoom;
  preventDefault(): void;
  stopPropagation(): void;
}

/**
 * Plugin API - methods exposed to plugins for interacting with zPhotoZoom
 */
export interface PluginAPI {
  /** Get current image transformation state */
  getImageState(): ImageState | null;

  /** Set image transformation (scale, position) */
  setImageTransform(scale: number, x: number, y: number, animate?: boolean): void;

  /** Center image with custom options */
  centerImage(options?: CenterImageOptions): void;

  /** Reset image to original centered state */
  resetImage(): void;

  /** Get the current image element */
  getCurrentImageElement(): HTMLImageElement | null;

  /** Get the preview container element */
  getPreviewContainer(): HTMLElement | null;

  /** Check if viewer is currently open */
  isViewerOpen(): boolean;

  /** Open viewer programmatically (if implemented by instance) */
  openViewer?(imageNode: HTMLElement): void;

  /** Close viewer programmatically */
  closeViewer(): void;
}

/**
 * Base interface for zPhotoZoom plugins
 */
export interface ZPhotoZoomPlugin extends ZPhotoZoomPluginHooks {
  /** Unique plugin name */
  readonly name: string;

  /** Plugin version */
  readonly version?: string;

  /** Initialize plugin with zPhotoZoom instance */
  initialize(instance: zPhotoZoom, api: PluginAPI): void;

  /** Cleanup plugin resources */
  destroy?(): void;
}

/**
 * Plugin registry entry
 */
export interface PluginRegistryEntry {
  plugin: ZPhotoZoomPlugin;
  api: PluginAPI;
}

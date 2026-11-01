/**
 * Watermark positioning and sizing calculation utilities.
 * Enforces strict compliance with:
 * - Top-right placement
 * - 5% to 8% width ratio relative to the target image
 * - Padding from top and right edges
 * - Aspect ratio preservation
 */

export interface WatermarkPlacementOptions {
  imageWidth: number;
  imageHeight: number;
  logoWidth: number;
  logoHeight: number;
  /** Width ratio of the logo relative to the image width. Default is 0.065 (6.5%, within 5-8% range) */
  sizeRatio?: number;
  /** Edge padding as a fraction of image width. Default is 0.03 (3%) */
  paddingRatio?: number;
  /** Position locked to top-right by default */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export interface WatermarkBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
  sizeRatio: number;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Calculates exact coordinates and dimensions for placing the company logo watermark.
 */
export function calculateWatermarkBounds(options: WatermarkPlacementOptions): WatermarkBounds {
  const {
    imageWidth,
    imageHeight,
    logoWidth,
    logoHeight,
    position = 'top-right',
  } = options;

  if (imageWidth <= 0 || imageHeight <= 0 || logoWidth <= 0 || logoHeight <= 0) {
    return { x: 0, y: 0, width: 0, height: 0, paddingX: 0, paddingY: 0, sizeRatio: 0.065 };
  }

  // Strictly clamp size ratio within 5% to 8% (0.05 to 0.08)
  const rawRatio = options.sizeRatio ?? 0.065;
  const sizeRatio = clamp(rawRatio, 0.05, 0.08);

  // Default padding ratio 3.5% of shortest dimension for balanced breathing room
  const baseDim = Math.min(imageWidth, imageHeight);
  const rawPaddingRatio = options.paddingRatio ?? 0.035;
  const paddingRatio = clamp(rawPaddingRatio, 0.015, 0.08);
  const padding = Math.round(baseDim * paddingRatio);

  // Logo target width
  const targetWidth = Math.round(imageWidth * sizeRatio);
  const aspectRatio = logoWidth / logoHeight;
  const targetHeight = Math.round(targetWidth / aspectRatio);

  let x = imageWidth - targetWidth - padding;
  let y = padding;

  if (position === 'top-left') {
    x = padding;
    y = padding;
  } else if (position === 'bottom-right') {
    x = imageWidth - targetWidth - padding;
    y = imageHeight - targetHeight - padding;
  } else if (position === 'bottom-left') {
    x = padding;
    y = imageHeight - targetHeight - padding;
  }

  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.max(1, targetWidth),
    height: Math.max(1, targetHeight),
    paddingX: padding,
    paddingY: padding,
    sizeRatio,
  };
}

/**
 * Formats file size in bytes to readable string
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

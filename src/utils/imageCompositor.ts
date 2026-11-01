import { calculateWatermarkBounds, WatermarkBounds } from './watermark';
import { StudioGradientPreset } from './prompt';

export interface ComposeOptions {
  productImageSrc: string;
  logoImageSrc: string;
  gradientPreset?: StudioGradientPreset;
  /** Size ratio: 0.05 to 0.08 (5% - 8%) */
  watermarkSizeRatio?: number;
  /** Watermark padding ratio: 0.02 to 0.06 */
  watermarkPaddingRatio?: number;
  /** Watermark opacity: 0.5 to 1.0 */
  watermarkOpacity?: number;
  /** Watermark position: top-right by default */
  watermarkPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Studio enhancement toggles */
  isolateSubject?: boolean;
  backgroundRemovalTolerance?: number;
  renderPedestal?: boolean;
  renderFloorReflection?: boolean;
  applyStudioLighting?: boolean;
  applyVignette?: boolean;
  applyContactShadow?: boolean;
  /** Output dimensions (defaults to source image size or max 2048) */
  targetWidth?: number;
  targetHeight?: number;
}

export interface ComposeResult {
  dataUrl: string;
  width: number;
  height: number;
  watermarkBounds: WatermarkBounds;
}

/**
 * Loads an image from a URL or Data URI into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image from source: ${src.slice(0, 50)}...`));
    img.src = src;
  });
}

/**
 * Detects background color from image perimeter and cleanly isolates the product subject
 * with smooth alpha edge matting.
 */
function isolateProductSubject(
  img: HTMLImageElement,
  tolerance = 28
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return c;

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, c.width, c.height);
  const data = imgData.data;
  const w = c.width;
  const h = c.height;

  // Check if image already has substantial transparency
  let hasAlpha = false;
  for (let i = 3; i < data.length; i += 40) {
    if (data[i] < 240) {
      hasAlpha = true;
      break;
    }
  }

  // If already transparent, return cleanly
  if (hasAlpha) {
    return c;
  }

  // Sample perimeter pixels to establish dominant background color
  const sampleIndices = [
    0, // top-left
    (w - 1) * 4, // top-right
    (h - 1) * w * 4, // bottom-left
    ((h - 1) * w + (w - 1)) * 4, // bottom-right
    Math.floor(w / 2) * 4, // top-center
    ((h - 1) * w + Math.floor(w / 2)) * 4, // bottom-center
  ];

  let bgR = 0, bgG = 0, bgB = 0;
  for (const idx of sampleIndices) {
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  }
  bgR /= sampleIndices.length;
  bgG /= sampleIndices.length;
  bgB /= sampleIndices.length;

  const featherRange = 22;

  // Apply smooth Euclidean chroma distance thresholding
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt(
      (r - bgR) * (r - bgR) +
      (g - bgG) * (g - bgG) +
      (b - bgB) * (b - bgB)
    );

    if (dist < tolerance) {
      data[i + 3] = 0;
    } else if (dist < tolerance + featherRange) {
      const factor = (dist - tolerance) / featherRange;
      data[i + 3] = Math.round(data[i + 3] * factor);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return c;
}

/**
 * Finds the tight bounding box of visible product pixels
 */
function getForegroundBoundingBox(canvas: HTMLCanvasElement): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { x: 0, y: 0, width: canvas.width, height: canvas.height };
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  let minX = w, minY = h, maxX = 0, maxY = 0;
  let hasPixels = false;

  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 20) {
        hasPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasPixels || minX >= maxX || minY >= maxY) {
    return { x: 0, y: 0, width: w, height: h };
  }

  const pad = 2;
  const rx = Math.max(0, minX - pad);
  const ry = Math.max(0, minY - pad);
  const rw = Math.min(w - rx, maxX - minX + pad * 2);
  const rh = Math.min(h - ry, maxY - minY + pad * 2);

  return { x: rx, y: ry, width: rw, height: rh };
}

/**
 * Composites the commercial product image into a high-end photography studio scene
 * featuring an isolated product, 3D display pedestal, soft contact shadows, floor reflections,
 * softbox lighting, and Top-Right company watermark.
 */
export async function composeCommercialProduct(options: ComposeOptions): Promise<ComposeResult> {
  const [productImg, logoImg] = await Promise.all([
    loadImage(options.productImageSrc),
    loadImage(options.logoImageSrc),
  ]);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const width = options.targetWidth || Math.max(1200, productImg.naturalWidth);
  const height = options.targetHeight || Math.max(1200, productImg.naturalHeight);
  canvas.width = width;
  canvas.height = height;

  // 1. Render Luxury Gradient Studio Backdrop
  const preset = options.gradientPreset;
  if (preset) {
    const [c1, c2, c3] = preset.colorStops;

    // Smooth spherical studio spotlight gradient centered above product
    const spotlight = ctx.createRadialGradient(
      width * 0.5,
      height * 0.30,
      width * 0.08,
      width * 0.5,
      height * 0.45,
      width * 0.82
    );
    spotlight.addColorStop(0, c1);
    spotlight.addColorStop(0.55, c2);
    spotlight.addColorStop(1, c3 || c2);
    ctx.fillStyle = spotlight;
    ctx.fillRect(0, 0, width, height);

    // Studio horizon / floor plane
    const floorY = height * 0.68;
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, height);
    floorGrad.addColorStop(0, preset.darkBackground ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)');
    floorGrad.addColorStop(1, preset.darkBackground ? 'rgba(0, 0, 0, 0.65)' : 'rgba(0, 0, 0, 0.18)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, width, height - floorY);
  }

  // 2. Isolate the product subject (remove raw flat backdrop)
  const shouldIsolate = options.isolateSubject !== false;
  const subjectCanvas = shouldIsolate
    ? isolateProductSubject(productImg, options.backgroundRemovalTolerance || 28)
    : (() => {
        const fallbackC = document.createElement('canvas');
        fallbackC.width = productImg.naturalWidth;
        fallbackC.height = productImg.naturalHeight;
        const fctx = fallbackC.getContext('2d');
        fctx?.drawImage(productImg, 0, 0);
        return fallbackC;
      })();

  // Find tight bounding box of visible foreground subject
  const bbox = getForegroundBoundingBox(subjectCanvas);

  // Compute product placement dimensions
  const maxProductWidth = width * 0.62;
  const maxProductHeight = height * 0.52;
  const scale = Math.min(
    maxProductWidth / bbox.width,
    maxProductHeight / bbox.height,
    1.4
  );
  const drawW = Math.round(bbox.width * scale);
  const drawH = Math.round(bbox.height * scale);
  const drawX = Math.round((width - drawW) / 2);
  const floorY = Math.round(height * 0.68);
  const drawY = floorY - drawH;

  // 3. Render 3D Commercial Pedestal (Podium)
  if (options.renderPedestal !== false) {
    ctx.save();
    const pedestalRx = Math.max(drawW * 0.58, width * 0.24);
    const pedestalRy = Math.max(22, Math.round(pedestalRx * 0.22));
    const pedestalH = Math.max(30, Math.round(height * 0.05));
    const pedestalX = width * 0.5;
    const pedestalY = floorY;

    // Pedestal ambient floor shadow
    ctx.beginPath();
    ctx.ellipse(pedestalX, pedestalY + pedestalH * 0.8, pedestalRx * 1.15, pedestalRy * 1.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.filter = `blur(${Math.max(6, Math.round(width * 0.015))}px)`;
    ctx.fill();
    ctx.filter = 'none';

    // Pedestal cylinder body
    const bodyGrad = ctx.createLinearGradient(pedestalX - pedestalRx, 0, pedestalX + pedestalRx, 0);
    bodyGrad.addColorStop(0, '#11151c');
    bodyGrad.addColorStop(0.3, '#1e2633');
    bodyGrad.addColorStop(0.5, '#334155');
    bodyGrad.addColorStop(0.7, '#1e2633');
    bodyGrad.addColorStop(1, '#0f141d');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.rect(pedestalX - pedestalRx, pedestalY, pedestalRx * 2, pedestalH);
    ctx.fill();

    // Pedestal bottom curve
    ctx.beginPath();
    ctx.ellipse(pedestalX, pedestalY + pedestalH, pedestalRx, pedestalRy, 0, 0, Math.PI);
    ctx.fill();

    // Pedestal top surface (beveled circular disc with subtle copper/slate rim)
    const topGrad = ctx.createRadialGradient(pedestalX, pedestalY, 0, pedestalX, pedestalY, pedestalRx);
    topGrad.addColorStop(0, '#2b3648');
    topGrad.addColorStop(0.85, '#18202c');
    topGrad.addColorStop(1, '#0f131a');

    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.ellipse(pedestalX, pedestalY, pedestalRx, pedestalRy, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bevel rim highlight in copper/gold tone matching brand logo
    ctx.strokeStyle = preset?.darkBackground ? 'rgba(234, 88, 12, 0.5)' : 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // 4. Render Contact Occlusion Shadow directly beneath product
  if (options.applyContactShadow !== false) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      width * 0.5,
      floorY,
      drawW * 0.38,
      Math.max(8, height * 0.022),
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.filter = `blur(${Math.max(4, Math.round(width * 0.012))}px)`;
    ctx.fill();
    ctx.restore();
  }

  // 5. Render Glossy Floor Reflection with vertical gradient fade
  if (options.renderFloorReflection !== false) {
    ctx.save();
    ctx.beginPath();
    // Clip reflection to floor region below floorY
    ctx.rect(0, floorY, width, height - floorY);
    ctx.clip();

    // Flip vertically around pedestal baseline
    ctx.translate(0, floorY * 2);
    ctx.scale(1, -1);

    // Draw inverted reflection using cropped bounding box
    ctx.globalAlpha = 0.25;
    ctx.filter = 'blur(2.5px)';
    ctx.drawImage(
      subjectCanvas,
      bbox.x,
      bbox.y,
      bbox.width,
      bbox.height,
      drawX,
      drawY,
      drawW,
      drawH
    );
    ctx.restore();

    // Fade out bottom of reflection with gradient mask
    ctx.save();
    const reflectMask = ctx.createLinearGradient(0, floorY, 0, floorY + drawH * 0.65);
    reflectMask.addColorStop(0, 'rgba(0, 0, 0, 0)');
    reflectMask.addColorStop(1, preset?.darkBackground ? '#0b0e14' : '#e2e6eb');
    ctx.fillStyle = reflectMask;
    ctx.fillRect(0, floorY, width, height - floorY);
    ctx.restore();
  }

  // 6. Draw the isolated product subject in crisp focus directly on pedestal
  ctx.save();
  ctx.drawImage(
    subjectCanvas,
    bbox.x,
    bbox.y,
    bbox.width,
    bbox.height,
    drawX,
    drawY,
    drawW,
    drawH
  );
  ctx.restore();

  // 7. Commercial Studio Lighting & Softbox Spotlight Highlights
  if (options.applyStudioLighting !== false) {
    ctx.save();
    // Soft overhead commercial key-light
    const keyLight = ctx.createRadialGradient(
      width * 0.5,
      height * 0.28,
      width * 0.05,
      width * 0.5,
      height * 0.45,
      width * 0.45
    );
    keyLight.addColorStop(0, 'rgba(255, 255, 255, 0.09)');
    keyLight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = keyLight;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 8. Studio Vignette for cinematic focus
  if (options.applyVignette !== false) {
    ctx.save();
    const vignette = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      width * 0.35,
      width * 0.5,
      height * 0.5,
      width * 0.75
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // 9. Watermark Placement: Top-Right corner, 5-8% width strictly enforced
  const watermarkBounds = calculateWatermarkBounds({
    imageWidth: width,
    imageHeight: height,
    logoWidth: logoImg.naturalWidth,
    logoHeight: logoImg.naturalHeight,
    sizeRatio: options.watermarkSizeRatio ?? 0.065,
    paddingRatio: options.watermarkPaddingRatio ?? 0.035,
    position: options.watermarkPosition ?? 'top-right',
  });

  ctx.save();
  ctx.globalAlpha = options.watermarkOpacity ?? 0.95;

  // Add subtle ambient drop-shadow for pristine visibility on any background
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = Math.max(4, Math.round(watermarkBounds.width * 0.08));
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = Math.max(2, Math.round(watermarkBounds.width * 0.04));

  ctx.drawImage(
    logoImg,
    watermarkBounds.x,
    watermarkBounds.y,
    watermarkBounds.width,
    watermarkBounds.height
  );
  ctx.restore();

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width,
    height,
    watermarkBounds,
  };
}

/**
 * Overlays the watermark directly onto an existing processed image
 */
export async function overlayWatermarkOnly(
  baseImageSrc: string,
  logoImageSrc: string,
  sizeRatio: number = 0.065,
  paddingRatio: number = 0.035,
  opacity: number = 0.95
): Promise<string> {
  const [baseImg, logoImg] = await Promise.all([
    loadImage(baseImageSrc),
    loadImage(logoImageSrc),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = baseImg.naturalWidth;
  canvas.height = baseImg.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2D context');

  // Draw base image
  ctx.drawImage(baseImg, 0, 0);

  // Calculate watermark in top right (5-8% image width)
  const bounds = calculateWatermarkBounds({
    imageWidth: canvas.width,
    imageHeight: canvas.height,
    logoWidth: logoImg.naturalWidth,
    logoHeight: logoImg.naturalHeight,
    sizeRatio,
    paddingRatio,
    position: 'top-right',
  });

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = Math.max(3, Math.round(bounds.width * 0.08));
  ctx.shadowOffsetY = 2;
  ctx.drawImage(logoImg, bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

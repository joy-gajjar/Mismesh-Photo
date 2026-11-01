import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateWatermarkBounds, clamp, formatBytes } from './watermark';

test('clamp correctly bounds numbers', () => {
  assert.equal(clamp(0.04, 0.05, 0.08), 0.05);
  assert.equal(clamp(0.09, 0.05, 0.08), 0.08);
  assert.equal(clamp(0.065, 0.05, 0.08), 0.065);
});

test('calculateWatermarkBounds calculates top-right position and 5-8% width', () => {
  const bounds = calculateWatermarkBounds({
    imageWidth: 1000,
    imageHeight: 1000,
    logoWidth: 200,
    logoHeight: 200,
    sizeRatio: 0.07, // 7%
    paddingRatio: 0.03, // 3%
    position: 'top-right',
  });

  // Target width should be 70px (7% of 1000)
  assert.equal(bounds.width, 70);
  assert.equal(bounds.height, 70);
  assert.equal(bounds.sizeRatio, 0.07);

  // Padding should be 30px
  assert.equal(bounds.paddingX, 30);
  assert.equal(bounds.paddingY, 30);

  // Top-right x should be imageWidth - targetWidth - padding = 1000 - 70 - 30 = 900
  assert.equal(bounds.x, 900);
  // Top-right y should be padding = 30
  assert.equal(bounds.y, 30);
});

test('calculateWatermarkBounds enforces 5-8% limit even if user passes out-of-range values', () => {
  const tooSmall = calculateWatermarkBounds({
    imageWidth: 2000,
    imageHeight: 2000,
    logoWidth: 500,
    logoHeight: 500,
    sizeRatio: 0.02, // 2% -> clamped to 5%
  });
  assert.equal(tooSmall.sizeRatio, 0.05);
  assert.equal(tooSmall.width, 100); // 5% of 2000

  const tooLarge = calculateWatermarkBounds({
    imageWidth: 2000,
    imageHeight: 2000,
    logoWidth: 500,
    logoHeight: 500,
    sizeRatio: 0.15, // 15% -> clamped to 8%
  });
  assert.equal(tooLarge.sizeRatio, 0.08);
  assert.equal(tooLarge.width, 160); // 8% of 2000
});

test('calculateWatermarkBounds handles non-square aspect ratios cleanly', () => {
  const rectangular = calculateWatermarkBounds({
    imageWidth: 1200,
    imageHeight: 800,
    logoWidth: 400,
    logoHeight: 200, // 2:1 aspect ratio
    sizeRatio: 0.06,
  });

  assert.equal(rectangular.width, 72); // 6% of 1200
  assert.equal(rectangular.height, 36); // 72 / 2
});

test('formatBytes formats file sizes correctly', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1048576), '1 MB');
});

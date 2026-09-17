// utils
import { createImagePlaceholderPixels } from '../createImagePlaceholderPixels';

const TEXTURE_SIZE = 256;

const readPixel = (pixels: Uint8Array, x: number, y: number): [number, number, number, number] => {
  const offset = (y * TEXTURE_SIZE + x) * 4;

  return [pixels[offset], pixels[offset + 1], pixels[offset + 2], pixels[offset + 3]];
};

describe('createImagePlaceholderPixels', () => {
  it('should return a fully opaque RGBA buffer sized for the whole texture', () => {
    // before
    const pixels = createImagePlaceholderPixels();

    // result
    expect(pixels.length).toBe(TEXTURE_SIZE * TEXTURE_SIZE * 4);
    expect(pixels[3]).toBe(255);
  });

  it('should alternate between the two placeholder colors square by square', () => {
    // before
    const pixels = createImagePlaceholderPixels();

    // result — top-left square is color A, the next square over on the same row is color B
    expect(readPixel(pixels, 0, 0)).toEqual([255, 255, 255, 255]);
    expect(readPixel(pixels, TEXTURE_SIZE / 8, 0)).toEqual([225, 225, 225, 255]);

    // result — moving down one square (same column) also flips the color, like a real checkerboard
    expect(readPixel(pixels, 0, TEXTURE_SIZE / 8)).toEqual([225, 225, 225, 255]);
  });

  it('should return a deterministic buffer, unaffected by call order or prior calls', () => {
    // before
    const first = createImagePlaceholderPixels();
    const second = createImagePlaceholderPixels();

    // result
    expect(second).toEqual(first);
  });
});

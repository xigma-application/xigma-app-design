// utils
import { flipPixelRowsVertically } from './flipPixelRowsVertically';

export const createImageDataUrlFromPixels = (pixels: Uint8Array, width: number, height: number): string | null => {
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (context) {
    context.putImageData(new ImageData(flipPixelRowsVertically(pixels, width, height), width, height), 0, 0);
    return canvas.toDataURL('image/png');
  }

  return null;
};

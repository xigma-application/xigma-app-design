// utils
import { flipPixelRowsVertically } from './flipPixelRowsVertically';

export const createImageBlobFromPixels = (
  pixels: Uint8Array,
  width: number,
  height: number,
  mimeType: string,
  quality?: number,
): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (context) {
    context.putImageData(new ImageData(flipPixelRowsVertically(pixels, width, height), width, height), 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
  }

  return Promise.resolve(null);
};

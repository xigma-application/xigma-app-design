// types
import { TColorProfile } from 'types/canvas';

// utils
import { flipPixelRowsVertically } from './flipPixelRowsVertically';

const CANVAS_COLOR_SPACE: Record<TColorProfile, PredefinedColorSpace> = {
  displayP3: 'display-p3',
  srgb: 'srgb',
};

export const createImageBlobFromPixels = (
  pixels: Uint8Array,
  width: number,
  height: number,
  mimeType: string,
  quality?: number,
  colorProfile: TColorProfile = 'srgb',
): Promise<Blob | null> => {
  const canvas = document.createElement('canvas');
  const colorSpace = CANVAS_COLOR_SPACE[colorProfile];

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', { colorSpace });

  if (context) {
    context.putImageData(new ImageData(flipPixelRowsVertically(pixels, width, height), width, height, { colorSpace }), 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
  }

  return Promise.resolve(null);
};

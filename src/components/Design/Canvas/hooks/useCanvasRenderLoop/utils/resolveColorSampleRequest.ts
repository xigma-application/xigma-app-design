import { RefObject } from 'react';

// others
import { COLOR_SAMPLE_GRID_SIZE } from 'constant/canvas';

// types
import { TColorSampleRequest } from 'utils/canvas/colorPixelSampler/types';
import { TRgba } from 'types/color';

const SAMPLE_RADIUS = Math.floor(COLOR_SAMPLE_GRID_SIZE / 2);

const toTopToBottomRgbaGrid = (pixels: Uint8Array): TRgba[] => {
  const colors: TRgba[] = [];

  for (let row = COLOR_SAMPLE_GRID_SIZE - 1; row >= 0; row -= 1) {
    for (let col = 0; col < COLOR_SAMPLE_GRID_SIZE; col += 1) {
      const i = (row * COLOR_SAMPLE_GRID_SIZE + col) * 4;

      colors.push({ a: pixels[i + 3], b: pixels[i + 2], g: pixels[i + 1], r: pixels[i] });
    }
  }

  return colors;
};

export const resolveColorSampleRequest = (
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  requestRef: RefObject<TColorSampleRequest | null>,
): void => {
  const request = requestRef.current;

  if (request) {
    const rect = canvas.getBoundingClientRect();
    const bufferX = Math.round((request.x - rect.left) * (canvas.width / rect.width));
    const bufferY = Math.round((request.y - rect.top) * (canvas.height / rect.height));
    const pixels = new Uint8Array(COLOR_SAMPLE_GRID_SIZE * COLOR_SAMPLE_GRID_SIZE * 4);

    gl.readPixels(
      bufferX - SAMPLE_RADIUS,
      canvas.height - bufferY - SAMPLE_RADIUS - 1,
      COLOR_SAMPLE_GRID_SIZE,
      COLOR_SAMPLE_GRID_SIZE,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels,
    );

    request.onSample(toTopToBottomRgbaGrid(pixels));
    requestRef.current = null;
  }
};

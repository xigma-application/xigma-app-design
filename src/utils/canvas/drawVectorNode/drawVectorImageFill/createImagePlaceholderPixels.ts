// constant
import {
  IMAGE_FILL_PLACEHOLDER_COLOR_A,
  IMAGE_FILL_PLACEHOLDER_COLOR_B,
  IMAGE_PLACEHOLDER_CHECKER_SQUARES,
  IMAGE_PLACEHOLDER_TEXTURE_SIZE_PX,
} from 'constant/canvas';

// utils
import { hexToRgbFloat } from '../../hexToRgbFloat';

const toRgbByte = (component: number): number => Math.round(component * 255);

export const createImagePlaceholderPixels = (): Uint8Array => {
  const size = IMAGE_PLACEHOLDER_TEXTURE_SIZE_PX;
  const squareSize = size / IMAGE_PLACEHOLDER_CHECKER_SQUARES;
  const [rA, gA, bA] = hexToRgbFloat(IMAGE_FILL_PLACEHOLDER_COLOR_A).map(toRgbByte);
  const [rB, gB, bB] = hexToRgbFloat(IMAGE_FILL_PLACEHOLDER_COLOR_B).map(toRgbByte);
  const pixels = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const isColorA = (Math.floor(x / squareSize) + Math.floor(y / squareSize)) % 2 === 0;
      const offset = (y * size + x) * 4;

      pixels[offset] = isColorA ? rA : rB;
      pixels[offset + 1] = isColorA ? gA : gB;
      pixels[offset + 2] = isColorA ? bA : bB;
      pixels[offset + 3] = 255;
    }
  }

  return pixels;
};

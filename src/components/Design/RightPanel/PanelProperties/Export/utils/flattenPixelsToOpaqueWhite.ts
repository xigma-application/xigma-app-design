export const flattenPixelsToOpaqueWhite = (pixels: Uint8Array): Uint8Array => {
  const flattened = new Uint8Array(pixels.length);

  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3] / 255;

    flattened[index] = Math.round(pixels[index] * alpha + 255 * (1 - alpha));
    flattened[index + 1] = Math.round(pixels[index + 1] * alpha + 255 * (1 - alpha));
    flattened[index + 2] = Math.round(pixels[index + 2] * alpha + 255 * (1 - alpha));
    flattened[index + 3] = 255;
  }

  return flattened;
};

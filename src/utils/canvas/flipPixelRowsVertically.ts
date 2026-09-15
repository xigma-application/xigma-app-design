export const flipPixelRowsVertically = (pixels: Uint8Array, width: number, height: number): Uint8ClampedArray<ArrayBuffer> => {
  const flipped = new Uint8ClampedArray(pixels.length);
  const rowBytes = width * 4;

  for (let row = 0; row < height; row += 1) {
    const sourceStart = row * rowBytes;
    const targetStart = (height - row - 1) * rowBytes;

    flipped.set(pixels.subarray(sourceStart, sourceStart + rowBytes), targetStart);
  }

  return flipped;
};

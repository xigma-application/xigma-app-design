// utils
import { sampleBrushAlpha } from '../sampleBrushAlpha';

const alpha = { data: Float32Array.from([0, 1, 1, 0]), height: 2, width: 2 };

describe('sampleBrushAlpha', () => {
  it('should return the pixel value on a whole pixel', () => {
    // result
    expect(sampleBrushAlpha(alpha, 1, 0)).toBe(1);
  });

  it('should blend the four neighbours between pixels', () => {
    // result
    expect(sampleBrushAlpha(alpha, 0.5, 0.5)).toBe(0.5);
  });

  it('should treat pixels outside the image as transparent', () => {
    // result
    expect(sampleBrushAlpha(alpha, -1, -1)).toBe(0);
    expect(sampleBrushAlpha(alpha, 1.5, 1.5)).toBe(0);
  });
});

// utils
import { createAlpha, straightBand, wavyBand } from '../../test/brushFixtures';
import { extractBrushStrip } from '../extractBrushStrip';

describe('extractBrushStrip', () => {
  it('should straighten a flat band into a strip whose scale is its half thickness', () => {
    // action
    const strip = extractBrushStrip(straightBand)!;

    // result
    expect(strip.length).toBeGreaterThan(170);
    expect(strip.scale).toBeGreaterThan(9);
    expect(strip.scale).toBeLessThan(10.5);
    expect(strip.data).toHaveLength(strip.length * strip.height);
  });

  it('should straighten a wavy band too, keeping the half thickness about constant', () => {
    // action
    const strip = extractBrushStrip(wavyBand)!;

    // result
    expect(strip.scale).toBeGreaterThan(5);
    expect(strip.scale).toBeLessThan(8);
    expect(strip.length).toBeGreaterThan(380);
  });

  it('should return null for an empty image', () => {
    // result
    expect(extractBrushStrip(createAlpha(50, 50, () => false))).toBeNull();
  });
});

// utils
import { computeBrushShape } from '../computeBrushShape';
import { createAlpha, straightBand, wavyBand } from './brushFixtures';
import { extractBrushStrip } from '../extractBrushStrip/extractBrushStrip';
import { simplifyBrushLoop } from '../simplifyBrushLoop';
import { traceBrushContours } from '../traceBrushContours/traceBrushContours';

describe('traceBrushContours', () => {
  it('should trace one closed loop around a band, spanning u 0-1 and v about -1 to 1', () => {
    // before
    const strip = extractBrushStrip(straightBand)!;

    // action
    const loops = traceBrushContours(strip);
    const us = loops.flat().map((point) => point.u);
    const vs = loops.flat().map((point) => point.v);

    // result
    expect(loops).toHaveLength(1);
    expect(Math.min(...us)).toBeLessThan(0.1);
    expect(Math.max(...us)).toBeGreaterThan(0.9);
    expect(Math.max(...vs)).toBeCloseTo(1, 0);
    expect(Math.min(...vs)).toBeCloseTo(-1, 0);
  });

  it('should keep a hole as its own loop', () => {
    // before
    const holed = createAlpha(200, 60, (x, y) => x >= 10 && x < 190 && y >= 20 && y < 40 && !(x >= 90 && x < 100 && y >= 26 && y < 34));

    // action
    const loops = traceBrushContours(extractBrushStrip(holed)!);

    // result
    expect(loops).toHaveLength(2);
  });
});

describe('simplifyBrushLoop', () => {
  it('should drop collinear points and keep the corners', () => {
    // before
    const square = [
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 5 },
      { x: 10, y: 10 },
      { x: 5, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 5 },
    ];

    // result
    expect(simplifyBrushLoop(square, 0.1).length).toBeLessThan(square.length);
  });
});

describe('computeBrushShape', () => {
  it('should return the contours and scatter stats of a brush image', () => {
    // action
    const shape = computeBrushShape(wavyBand)!;

    // result
    expect(shape.contours.length).toBeGreaterThan(0);
    expect(shape.scatter.coverage).toBeGreaterThan(0.5);
    expect(shape.scatter.crossSigma).toBeGreaterThan(0.08);
  });

  it('should return null for an empty image', () => {
    // result
    expect(computeBrushShape(createAlpha(20, 20, () => false))).toBeNull();
  });
});

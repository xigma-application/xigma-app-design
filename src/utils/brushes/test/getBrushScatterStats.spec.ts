// types
import { TBrushStrip } from '../types';

// utils
import { getBrushScatterStats } from '../getBrushScatterStats';

const strip = (rows: number[][], scale = 2): TBrushStrip => ({
  data: Float32Array.from(rows.flat()),
  halfWidth: (rows.length - 1) / 2,
  height: rows.length,
  length: rows[0].length,
  scale,
});

describe('getBrushScatterStats', () => {
  it('should measure the coverage and spread of a solid band, with the dot radius from the median loop area', () => {
    // mock
    const band = strip([
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ]);
    const loop = [
      { u: 0, v: -1 },
      { u: 1, v: -1 },
      { u: 1, v: 1 },
      { u: 0, v: 1 },
    ];

    // before
    const stats = getBrushScatterStats(band, [loop, loop.slice(0, 3)]);

    // result
    expect(stats.coverage).toBe(1);
    expect(stats.crossSigma).toBeGreaterThanOrEqual(0.08);
    expect(stats.crossSigma).toBeLessThanOrEqual(0.4);
    expect(stats.dotRadiusRatio).toBe(0.06);
  });

  it('should fall back to default spread and the minimum dot radius for an empty strip', () => {
    // before
    const stats = getBrushScatterStats(
      strip(
        [
          [0, 0],
          [0, 0],
          [0, 0],
        ],
        1,
      ),
      [],
    );

    // result
    expect(stats).toEqual({ coverage: 0, crossSigma: 0.2, dotRadiusRatio: 0.008 });
  });

  it('should report no coverage when no row lies inside the brush width', () => {
    // before
    const stats = getBrushScatterStats(strip([[1], [1]], 0.1), []);

    // result
    expect(stats.coverage).toBe(0);
  });
});

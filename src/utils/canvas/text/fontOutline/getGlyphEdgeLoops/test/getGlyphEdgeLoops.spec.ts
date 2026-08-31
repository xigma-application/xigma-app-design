import { Path, PathCommand } from 'opentype.js';

// utils
import { getGlyphEdgeLoops } from '../getGlyphEdgeLoops';

const buildPath = (commands: PathCommand[]): Path => ({ commands }) as Path;

describe('getGlyphEdgeLoops', () => {
  it('should build one closed loop of straight edges for a simple "L"-only contour', () => {
    // mock — a triangle: M, L, L, Z
    const path = buildPath([{ type: 'M', x: 0, y: 0 }, { type: 'L', x: 10, y: 0 }, { type: 'L', x: 0, y: 10 }, { type: 'Z' }]);

    // action
    const loops = getGlyphEdgeLoops(path);

    // result — Z closes back to the start, adding the third edge
    expect(loops).toHaveLength(1);
    expect(loops[0]).toHaveLength(3);
    expect(loops[0].every((edge) => edge.tangentStart === null && edge.tangentEnd === null)).toBe(true);
  });

  it('should return two loops for a glyph with two subpaths (e.g. the outer and inner contour of "o")', () => {
    // mock
    const path = buildPath([
      { type: 'M', x: 0, y: 0 },
      { type: 'L', x: 10, y: 0 },
      { type: 'L', x: 10, y: 10 },
      { type: 'Z' },
      { type: 'M', x: 2, y: 2 },
      { type: 'L', x: 8, y: 2 },
      { type: 'L', x: 8, y: 8 },
      { type: 'Z' },
    ]);

    // action
    const loops = getGlyphEdgeLoops(path);

    // result
    expect(loops).toHaveLength(2);
  });

  it('should convert a quadratic curve command into an equivalent cubic tangent pair', () => {
    // mock — a single quadratic curve from (0,0) to (10,0) via control point (5,10)
    const path = buildPath([{ type: 'M', x: 0, y: 0 }, { type: 'Q', x: 10, x1: 5, y: 0, y1: 10 }, { type: 'Z' }]);

    // action
    const [loop] = getGlyphEdgeLoops(path);

    // result — cubic control points sit 2/3 of the way from each endpoint towards (5, 10)
    expect(loop[0].tangentStart).toEqual({ x: (5 - 0) * (2 / 3), y: (10 - 0) * (2 / 3) });
    expect(loop[0].tangentEnd).toEqual({ x: (5 - 10) * (2 / 3), y: (10 - 0) * (2 / 3) });
  });

  it('should carry a cubic curve command through with tangents relative to its own endpoints', () => {
    // mock
    const path = buildPath([{ type: 'M', x: 0, y: 0 }, { type: 'C', x: 10, x1: 2, x2: 8, y: 0, y1: 6, y2: 6 }, { type: 'Z' }]);

    // action
    const [loop] = getGlyphEdgeLoops(path);

    // result
    expect(loop[0].tangentStart).toEqual({ x: 2, y: 6 });
    expect(loop[0].tangentEnd).toEqual({ x: 8 - 10, y: 6 });
  });

  it('should not add a zero-length closing edge when the path already ends back at its start', () => {
    // mock — the last L already lands exactly back on the M point
    const path = buildPath([{ type: 'M', x: 0, y: 0 }, { type: 'L', x: 10, y: 0 }, { type: 'L', x: 0, y: 0 }, { type: 'Z' }]);

    // action
    const [loop] = getGlyphEdgeLoops(path);

    // result — only the 2 real edges, no extra zero-length one from Z
    expect(loop).toHaveLength(2);
  });

  it('should ignore a trailing empty subpath (a moveTo with nothing drawn after it)', () => {
    // mock
    const path = buildPath([
      { type: 'M', x: 0, y: 0 },
      { type: 'L', x: 10, y: 0 },
      { type: 'L', x: 0, y: 10 },
      { type: 'Z' },
      { type: 'M', x: 100, y: 100 },
    ]);

    // action
    const loops = getGlyphEdgeLoops(path);

    // result
    expect(loops).toHaveLength(1);
  });
});

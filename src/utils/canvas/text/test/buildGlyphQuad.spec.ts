// types
import { TGlyphChar } from 'types/msdf';

// utils
import { buildGlyphQuad } from '../buildGlyphQuad';

const GLYPH: TGlyphChar = { height: 12, id: 65, width: 8, x: 10, xadvance: 12, xoffset: 1, y: 20, yoffset: 2 };

describe('buildGlyphQuad', () => {
  it('should build 6 interleaved [x, y, u, v] vertices positioned and scaled from the glyph metrics', () => {
    // result
    expect(buildGlyphQuad(GLYPH, 100, 200, 2, 100, 100)).toEqual([
      102, 204, 0.1, 0.2, 118, 204, 0.18, 0.2, 118, 228, 0.18, 0.32, 102, 204, 0.1, 0.2, 118, 228, 0.18, 0.32, 102, 228, 0.1, 0.32,
    ]);
  });

  it('should leave the quad unrotated when no rotation is provided', () => {
    // before
    const withoutRotation = buildGlyphQuad(GLYPH, 0, 0, 2, 100, 100);
    const withZeroDegreesRotation = buildGlyphQuad(GLYPH, 0, 0, 2, 100, 100, { anchor: { x: 0, y: 0 }, angleDegrees: 0 });

    // result
    expect(withZeroDegreesRotation).toEqual(withoutRotation);
  });

  it('should rotate the quad corners around the local origin and translate them to the anchor', () => {
    // before
    const vertices = buildGlyphQuad(GLYPH, 0, 0, 2, 100, 100, { anchor: { x: 50, y: 50 }, angleDegrees: 90 });

    // result — a +90deg rotation swaps x/y (with a sign flip), then the anchor is added as a translation
    expect(vertices[0]).toBeCloseTo(50 - 4, 5);
    expect(vertices[1]).toBeCloseTo(50 + 2, 5);
  });
});

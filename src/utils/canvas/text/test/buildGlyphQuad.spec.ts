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
});

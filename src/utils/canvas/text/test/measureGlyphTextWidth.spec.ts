// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { measureGlyphTextWidth } from '../measureGlyphTextWidth';

const ATLAS: TGlyphAtlasJson = {
  chars: [
    { height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 },
    { height: 10, id: 66, width: 8, x: 8, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 },
  ],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

describe('measureGlyphTextWidth', () => {
  it('should sum the advance of every character in the string', () => {
    // result — 'AB' is two 12-unit advances at scale 1
    expect(measureGlyphTextWidth(ATLAS, 'AB', 20)).toBe(24);
  });

  it('should include the fallback width for characters outside the baked charset', () => {
    // result — 'A' (12) + missing-glyph fallback (0.6 * 20 = 12)
    expect(measureGlyphTextWidth(ATLAS, 'A?', 20)).toBe(24);
  });

  it('should return 0 for an empty string', () => {
    // result
    expect(measureGlyphTextWidth(ATLAS, '', 20)).toBe(0);
  });
});

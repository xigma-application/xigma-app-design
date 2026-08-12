// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getGlyphAdvance } from '../getGlyphAdvance';

const ATLAS: TGlyphAtlasJson = {
  chars: [{ height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 }],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

describe('getGlyphAdvance', () => {
  it('should return the glyph advance scaled to the requested font size', () => {
    // result — fontSize equals the atlas generation size, so scale is 1
    expect(getGlyphAdvance(ATLAS, 65, 20)).toBe(12);
  });

  it('should scale the advance proportionally to a different font size', () => {
    // result — fontSize is double the atlas generation size, so scale is 2
    expect(getGlyphAdvance(ATLAS, 65, 40)).toBe(24);
  });

  it('should fall back to an approximate width when the character is outside the baked charset', () => {
    // result — 0.6 * fontSize fallback for a missing glyph
    expect(getGlyphAdvance(ATLAS, 999, 20)).toBe(12);
  });
});

// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getGlyph } from '../getGlyph';

const ATLAS: TGlyphAtlasJson = {
  chars: [{ height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 }],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

describe('getGlyph', () => {
  it('should return the glyph matching the given character code', () => {
    // result
    expect(getGlyph(ATLAS, 65)).toEqual(ATLAS.chars[0]);
  });

  it('should return undefined when no glyph matches the character code', () => {
    // result
    expect(getGlyph(ATLAS, 999)).toBeUndefined();
  });
});

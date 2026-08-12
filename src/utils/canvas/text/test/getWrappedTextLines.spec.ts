// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getWrappedTextLines } from '../getWrappedTextLines';

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

describe('getWrappedTextLines', () => {
  it('should keep content on one line when it fits within the width', () => {
    // result — "AB AB" measured via glyph advances fits comfortably under a generous width
    expect(getWrappedTextLines(ATLAS, 'AB AB', 1000, 20)).toEqual(['AB AB']);
  });

  it('should wrap onto a new line once the glyph-measured width would overflow', () => {
    // result — "AB AB" is 60 units wide (24 + fallback space + 24), over a 50-unit budget
    expect(getWrappedTextLines(ATLAS, 'AB AB', 50, 20)).toEqual(['AB', 'AB']);
  });
});

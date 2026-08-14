// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getCaretPoint } from '../getCaretPoint';

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

describe('getCaretPoint', () => {
  it('should sit at the origin for offset 0', () => {
    // result
    expect(getCaretPoint(ATLAS, 'AB AB', 1000, 20, 100, 200, 0)).toEqual({ x: 100, y: 200 });
  });

  it('should advance by the sum of the preceding glyph widths, ignoring kerning', () => {
    // result — "AB" is 24 units wide (12 + 12)
    expect(getCaretPoint(ATLAS, 'AB AB', 1000, 20, 100, 200, 2)).toEqual({ x: 124, y: 200 });
  });

  it('should clamp an offset past the end of the content to the end of the last line', () => {
    // result — "AB AB" is 60 units wide total (24 + fallback space 12 + 24)
    expect(getCaretPoint(ATLAS, 'AB AB', 1000, 20, 100, 200, 999)).toEqual({ x: 160, y: 200 });
  });

  it('should clamp a negative offset to the start of the first line', () => {
    // result
    expect(getCaretPoint(ATLAS, 'AB AB', 1000, 20, 100, 200, -5)).toEqual({ x: 100, y: 200 });
  });

  it('should move to the next wrapped line, offsetting y by the line height', () => {
    // mock — "AB AB" wraps into ["AB", "AB"] at width 50, second "AB" starting at offset 3
    // result
    expect(getCaretPoint(ATLAS, 'AB AB', 50, 20, 100, 200, 3)).toEqual({ x: 100, y: 240 });
    expect(getCaretPoint(ATLAS, 'AB AB', 50, 20, 100, 200, 4)).toEqual({ x: 112, y: 240 });
  });
});

// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getTextLineWidths } from '../getTextLineWidths';

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

describe('getTextLineWidths', () => {
  it('should return a single width when the content fits on one line', () => {
    // result — "AB AB" is 60 units wide (24 + fallback space 12 + 24)
    expect(getTextLineWidths(ATLAS, 'AB AB', 1000, 20)).toEqual([60]);
  });

  it('should return one width per wrapped line', () => {
    // result — wraps into ["AB", "AB"], each 24 units wide
    expect(getTextLineWidths(ATLAS, 'AB AB', 50, 20)).toEqual([24, 24]);
  });

  it('should keep each line at its own width, not the widest line, across explicit newlines', () => {
    // result — "AB" is 24 units wide, "A" is 12 units wide
    expect(getTextLineWidths(ATLAS, 'AB\nA', 1000, 20)).toEqual([24, 12]);
  });
});

// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getFittedPathFontSize } from '../getFittedPathFontSize';

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

describe('getFittedPathFontSize', () => {
  it('should keep the authored font size when the text already fits the available length', () => {
    // result
    expect(getFittedPathFontSize(ATLAS, 'A', 20, 100)).toBe(20);
  });

  it('should shrink the font size until the text fits the available length', () => {
    // result — 'AB' unit width (fontSize 1) is 1.2, so 12 / 1.2 = 10
    expect(getFittedPathFontSize(ATLAS, 'AB', 20, 12)).toBeCloseTo(10);
  });

  it('should clamp the shrink to the minimum font size floor', () => {
    // result
    expect(getFittedPathFontSize(ATLAS, 'AB', 20, 1)).toBe(4);
  });

  it('should respect a custom minimum font size', () => {
    // result
    expect(getFittedPathFontSize(ATLAS, 'AB', 20, 1, 2)).toBe(2);
  });

  it('should return the authored font size for empty content', () => {
    // result
    expect(getFittedPathFontSize(ATLAS, '', 20, 1)).toBe(20);
  });
});

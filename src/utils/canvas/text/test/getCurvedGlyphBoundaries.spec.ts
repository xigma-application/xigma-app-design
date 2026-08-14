// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getCurvedGlyphBoundaries } from '../getCurvedGlyphBoundaries';

const ATLAS: TGlyphAtlasJson = {
  chars: [{ height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 }],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

describe('getCurvedGlyphBoundaries', () => {
  it('should return content.length + 1 boundaries, starting at startOffset * circumference', () => {
    // result
    expect(getCurvedGlyphBoundaries(ATLAS, 'AA', 20, 0, false, 100)).toEqual([0, 12, 24]);
  });

  it('should offset the boundaries by the starting arc length', () => {
    // result
    expect(getCurvedGlyphBoundaries(ATLAS, 'AA', 20, 0.5, false, 100)).toEqual([50, 62, 74]);
  });

  it('should walk backwards along the path when flipped', () => {
    // result
    expect(getCurvedGlyphBoundaries(ATLAS, 'AA', 20, 0, true, 100)).toEqual([0, -12, -24]);
  });

  it('should return a single boundary for empty content', () => {
    // result
    expect(getCurvedGlyphBoundaries(ATLAS, '', 20, 0, false, 100)).toEqual([0]);
  });
});

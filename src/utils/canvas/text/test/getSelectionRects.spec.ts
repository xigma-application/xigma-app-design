// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { getSelectionRects } from '../getSelectionRects';

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

describe('getSelectionRects', () => {
  it('should return no rects for a collapsed selection', () => {
    // result
    expect(getSelectionRects(ATLAS, 'AB AB', 1000, 20, 100, 200, 3, 3)).toEqual([]);
  });

  it('should return a single clipped rect for a selection within one unwrapped line', () => {
    // result — offsets 0-2 span "AB", 24 units wide
    expect(getSelectionRects(ATLAS, 'AB AB', 1000, 20, 100, 200, 0, 2)).toEqual([{ height: 40, width: 24, x: 100, y: 200 }]);
  });

  it('should return one clipped rect per wrapped line spanned by the range', () => {
    // mock — "AB AB" wraps into ["AB", "AB"] at width 50 (offsets [0, 3]); range 1-4 spans both lines
    // result
    expect(getSelectionRects(ATLAS, 'AB AB', 50, 20, 100, 200, 1, 4)).toEqual([
      { height: 40, width: 12, x: 112, y: 200 },
      { height: 40, width: 12, x: 100, y: 240 },
    ]);
  });

  it('should keep a fully-spanned middle line at its full width, clipping only the first and last lines', () => {
    // mock — "A\nB\nC" (offsets [0, 2, 4]); range 0-5 clips nothing on the first/last line either, since
    // both single-char lines are fully covered, but exercises the "not first, not last" middle-line branch
    // result
    expect(getSelectionRects(ATLAS, 'A\nB\nC', 1000, 20, 0, 0, 0, 5)).toEqual([
      { height: 40, width: 12, x: 0, y: 0 },
      { height: 40, width: 12, x: 0, y: 40 },
      { height: 40, width: 12, x: 0, y: 80 },
    ]);
  });
});

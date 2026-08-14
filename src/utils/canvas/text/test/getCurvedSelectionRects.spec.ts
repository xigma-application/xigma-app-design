// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { buildEllipseArcLengthTable } from '../../shapes/buildEllipseArcLengthTable';
import { getCurvedSelectionRects } from '../getCurvedSelectionRects';

const ATLAS: TGlyphAtlasJson = {
  chars: [{ height: 10, id: 65, width: 8, x: 0, xadvance: 12, xoffset: 1, y: 0, yoffset: 2 }],
  common: { base: 30, lineHeight: 40, scaleH: 100, scaleW: 100 },
  distanceField: { distanceRange: 4, fieldType: 'msdf' },
  info: { size: 20 },
  kernings: [],
  pages: ['atlas.png'],
};

const CENTER = { x: 100, y: 100 };
const TABLE = buildEllipseArcLengthTable(200, 200);

describe('getCurvedSelectionRects', () => {
  it('should return an empty array for a collapsed selection', () => {
    // result
    expect(getCurvedSelectionRects(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, 1, 1)).toEqual([]);
  });

  it('should return one rect per selected character', () => {
    // before
    const rects = getCurvedSelectionRects(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, 0, 2);

    // result
    expect(rects).toHaveLength(2);
    expect(rects[0].height).toBe(40);
    expect(rects[0].width).toBeCloseTo(12);
  });

  it('should clamp the selection range to the content length', () => {
    // before
    const rects = getCurvedSelectionRects(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, -5, 99);

    // result
    expect(rects).toHaveLength(3);
  });

  it('should reposition and rotate the rects when flipped', () => {
    // before
    const normal = getCurvedSelectionRects(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, 0, 1);
    const flipped = getCurvedSelectionRects(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, true, TABLE, 40, 0, 1);

    // result
    expect(flipped[0]).not.toEqual(normal[0]);
  });

  it('should position later characters farther along the curve', () => {
    // before
    const rects = getCurvedSelectionRects(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, 0, 3);

    // result
    expect(rects[0]).not.toEqual(rects[1]);
    expect(rects[1]).not.toEqual(rects[2]);
  });
});

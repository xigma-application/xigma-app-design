// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { buildEllipseArcLengthTable } from '../../shapes/buildEllipseArcLengthTable';
import { getCurvedCaretPoint } from '../getCurvedCaretPoint';

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

describe('getCurvedCaretPoint', () => {
  it('should place the caret at the rightmost point of the ellipse for index 0 at offset 0', () => {
    // before
    const point = getCurvedCaretPoint(ATLAS, 'AA', 20, 200, 200, CENTER, 0, false, TABLE, 0);

    // result
    expect(point.x).toBeCloseTo(200);
    expect(point.y).toBeCloseTo(100);
    expect(point.angleDegrees).toBeCloseTo(90);
  });

  it('should move the caret along the curve for a later character index', () => {
    // before
    const atStart = getCurvedCaretPoint(ATLAS, 'AA', 20, 200, 200, CENTER, 0, false, TABLE, 0);
    const atEnd = getCurvedCaretPoint(ATLAS, 'AA', 20, 200, 200, CENTER, 0, false, TABLE, 2);

    // result
    expect(atEnd).not.toEqual(atStart);
  });

  it('should clamp the caret index to the valid range', () => {
    // before
    const clampedHigh = getCurvedCaretPoint(ATLAS, 'AA', 20, 200, 200, CENTER, 0, false, TABLE, 99);
    const atEnd = getCurvedCaretPoint(ATLAS, 'AA', 20, 200, 200, CENTER, 0, false, TABLE, 2);
    const clampedLow = getCurvedCaretPoint(ATLAS, 'AA', 20, 200, 200, CENTER, 0, false, TABLE, -5);
    const atStart = getCurvedCaretPoint(ATLAS, 'AA', 20, 200, 200, CENTER, 0, false, TABLE, 0);

    // result
    expect(clampedHigh).toEqual(atEnd);
    expect(clampedLow).toEqual(atStart);
  });

  it('should rotate the tangent by 180 degrees when flipped', () => {
    // before
    const point = getCurvedCaretPoint(ATLAS, 'AA', 20, 200, 200, CENTER, 0, true, TABLE, 0);

    // result
    expect(point.angleDegrees).toBeCloseTo(270);
  });
});

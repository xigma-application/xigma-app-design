// utils
import { getGlyphFillVectors } from '../getGlyphFillVectors';
import { getSolidPaintColor } from 'utils/design/paint/getSolidPaintColor';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';

const TRIANGLE = [
  { end: { x: 10, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 5, y: 10 }, start: { x: 10, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 0, y: 0 }, start: { x: 5, y: 10 }, tangentEnd: null, tangentStart: null },
];
// offset well clear of TRIANGLE — like "I" and "o" sitting side by side, distinct glyphs never
// spatially overlap, so their loops must not cross when built as independent vectors
const SQUARE = [
  { end: { x: 30, y: 0 }, start: { x: 20, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 30, y: 10 }, start: { x: 30, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 20, y: 10 }, start: { x: 30, y: 10 }, tangentEnd: null, tangentStart: null },
  { end: { x: 20, y: 0 }, start: { x: 20, y: 10 }, tangentEnd: null, tangentStart: null },
];
// wound opposite to SQUARE (real TrueType/OpenType convention for a counter cut from solid ink) so
// hole-detection records it as SQUARE's own active hole, joining its color group
const HOLE = [
  { end: { x: 22, y: 8 }, start: { x: 22, y: 2 }, tangentEnd: null, tangentStart: null },
  { end: { x: 28, y: 8 }, start: { x: 22, y: 8 }, tangentEnd: null, tangentStart: null },
  { end: { x: 28, y: 2 }, start: { x: 28, y: 8 }, tangentEnd: null, tangentStart: null },
  { end: { x: 22, y: 2 }, start: { x: 28, y: 2 }, tangentEnd: null, tangentStart: null },
];

describe('getGlyphFillVectors', () => {
  it('should return one vector per glyph, each correctly ringing its own contours (e.g. "o")', () => {
    // action — "I" (one solid contour) and "o" (an outer contour + its own hole)
    const result = getGlyphFillVectors([[TRIANGLE], [SQUARE, HOLE]], '#123456');

    // result — index-aligned with the input, one entry per glyph
    expect(result).toHaveLength(2);
    expect(result[0]?.filledFaceKeys).toHaveLength(1);
    // "o" contributes 2 faces (outer + its own hole), same as the whole-text merge already verified
    // in getTextFlattenVector.spec.ts
    expect(result[1]?.filledFaceKeys).toHaveLength(2);
    expect(groupFilledFacesForRendering(result[1]!).find((group) => getSolidPaintColor(group.paint) === '#123456')?.polygons).toHaveLength(
      2,
    );
  });

  it('should return null in place of a glyph with no resolvable contours, keeping index alignment', () => {
    // action — a glyph with an empty contour list (e.g. a space) sits between two real glyphs
    const result = getGlyphFillVectors([[TRIANGLE], [], [SQUARE]], '#123456');

    // result
    expect(result).toHaveLength(3);
    expect(result[0]).not.toBeNull();
    expect(result[1]).toBeNull();
    expect(result[2]).not.toBeNull();
  });
});

// utils
import { getGlyphStrokeVectors } from '../getGlyphStrokeVectors';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';

const SQUARE = [
  { end: { x: 20, y: 0 }, start: { x: 0, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 20, y: 20 }, start: { x: 20, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 0, y: 20 }, start: { x: 20, y: 20 }, tangentEnd: null, tangentStart: null },
  { end: { x: 0, y: 0 }, start: { x: 0, y: 20 }, tangentEnd: null, tangentStart: null },
];
// offset well clear of SQUARE, standing in for a second glyph's own contour ("o"'s outer ring)
const SQUARE_2 = [
  { end: { x: 70, y: 0 }, start: { x: 50, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 70, y: 20 }, start: { x: 70, y: 0 }, tangentEnd: null, tangentStart: null },
  { end: { x: 50, y: 20 }, start: { x: 70, y: 20 }, tangentEnd: null, tangentStart: null },
  { end: { x: 50, y: 0 }, start: { x: 50, y: 20 }, tangentEnd: null, tangentStart: null },
];
// wound opposite to SQUARE_2, standing in for "o"'s own inner hole contour — real text stroke
// follows every contour of a glyph independently, so this becomes its OWN separate band, not a
// single ring spanning both, matching real -webkit-text-stroke behavior
const HOLE_2 = [
  { end: { x: 55, y: 15 }, start: { x: 55, y: 5 }, tangentEnd: null, tangentStart: null },
  { end: { x: 65, y: 15 }, start: { x: 55, y: 15 }, tangentEnd: null, tangentStart: null },
  { end: { x: 65, y: 5 }, start: { x: 65, y: 15 }, tangentEnd: null, tangentStart: null },
  { end: { x: 55, y: 5 }, start: { x: 65, y: 5 }, tangentEnd: null, tangentStart: null },
];

describe('getGlyphStrokeVectors', () => {
  it('should build one stroke vector per glyph, merging that glyph’s own contour bands', () => {
    // action — glyph 1 has one contour (its own ring band, 2 faces); glyph 2 has two contours
    // (an outer band and its own separate inner-hole band, 2 + 2 = 4 faces)
    const result = getGlyphStrokeVectors([[SQUARE], [SQUARE_2, HOLE_2]], 2, '#000000');

    // result — index-aligned with the input, one entry per glyph
    expect(result).toHaveLength(2);
    expect(result[0]?.filledFaceKeys).toHaveLength(2);
    expect(result[1]?.filledFaceKeys).toHaveLength(4);
    expect(groupFilledFacesForRendering(result[1]!).find((group) => group.color === '#000000')?.polygons).toHaveLength(4);
  });

  it('should return null in place of a glyph with no contours, keeping index alignment', () => {
    // action
    const result = getGlyphStrokeVectors([[SQUARE], []], 2, '#000000');

    // result
    expect(result).toHaveLength(2);
    expect(result[0]).not.toBeNull();
    expect(result[1]).toBeNull();
  });
});

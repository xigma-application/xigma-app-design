// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { buildEllipseArcLengthTable } from '../../shapes/buildEllipseArcLengthTable';
import { getCurvedSelectionEdges } from '../getCurvedSelectionEdges';

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

describe('getCurvedSelectionEdges', () => {
  it('should return an empty array for a collapsed selection', () => {
    // result
    expect(getCurvedSelectionEdges(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, 1, 1)).toEqual([]);
  });

  it('should return one more edge than the number of selected characters, one per boundary', () => {
    // before
    const edges = getCurvedSelectionEdges(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, 0, 2);

    // result — 2 selected characters share 3 boundary points (start, middle, end)
    expect(edges).toHaveLength(3);
  });

  it('should clamp the selection range to the content length', () => {
    // before
    const edges = getCurvedSelectionEdges(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, -5, 99);

    // result
    expect(edges).toHaveLength(4);
  });

  it('should reposition the edges when flipped', () => {
    // before
    const normal = getCurvedSelectionEdges(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, 0, 1);
    const flipped = getCurvedSelectionEdges(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, true, TABLE, 40, 0, 1);

    // result
    expect(flipped).not.toEqual(normal);
  });

  it('should share the exact same edge between two adjacent characters', () => {
    // before — the boundary between the first and second "A" is shared by both characters
    const twoChars = getCurvedSelectionEdges(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, 0, 2);
    const secondCharOnly = getCurvedSelectionEdges(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, 1, 2);

    // result
    expect(twoChars[1]).toEqual(secondCharOnly[0]);
  });

  it('should never let the span exceed 355 degrees, so text wrapping past a full turn stops growing instead of overlapping its own start', () => {
    // mock — enough "A"s (12 units advance each) to loop well past the ~629-unit circumference
    const longContent = 'A'.repeat(60);

    // before
    const edges = getCurvedSelectionEdges(ATLAS, longContent, 20, 200, 200, CENTER, 0, false, TABLE, 40, 0, 60);
    const lastEdge = edges[edges.length - 1];
    const secondToLastEdge = edges[edges.length - 2];

    // result — both trailing edges clamp to the exact same point (355 degrees from the start),
    // instead of continuing to advance past it and closing the loop
    expect(lastEdge).toEqual(secondToLastEdge);
    expect(lastEdge).not.toEqual(edges[0]);
  });
});

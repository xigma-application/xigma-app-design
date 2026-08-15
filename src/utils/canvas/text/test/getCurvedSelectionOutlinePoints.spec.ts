// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { buildEllipseArcLengthTable } from '../../shapes/buildEllipseArcLengthTable';
import { getCurvedSelectionEdges } from '../getCurvedSelectionEdges';
import { getCurvedSelectionOutlinePoints } from '../getCurvedSelectionOutlinePoints';

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

describe('getCurvedSelectionOutlinePoints', () => {
  it('should return an empty array for a collapsed selection', () => {
    // result
    expect(getCurvedSelectionOutlinePoints(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, 1, 1)).toEqual([]);
  });

  it('should return twice as many points as edges — the top row, then the bottom row reversed', () => {
    // before
    const edges = getCurvedSelectionEdges(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, 0, 2);
    const outline = getCurvedSelectionOutlinePoints(ATLAS, 'AAA', 20, 200, 200, CENTER, 0, false, TABLE, 40, 0, 2);

    // result
    expect(outline).toHaveLength(edges.length * 2);
    expect(outline[0]).toEqual(edges[0].top);
    expect(outline[edges.length]).toEqual(edges[edges.length - 1].bottom);
    expect(outline[outline.length - 1]).toEqual(edges[0].bottom);
  });
});

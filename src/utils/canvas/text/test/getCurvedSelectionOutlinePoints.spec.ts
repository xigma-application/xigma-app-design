// types
import { TGlyphAtlasJson } from 'types/msdf';

// utils
import { createEllipseTextPathSampler } from '../pathSampler/createEllipseTextPathSampler';
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
const SAMPLER = createEllipseTextPathSampler({ height: 200, rotation: 0, width: 200, x: 0, y: 0 });

describe('getCurvedSelectionOutlinePoints', () => {
  it('should return an empty array for a collapsed selection', () => {
    // result
    expect(getCurvedSelectionOutlinePoints(ATLAS, 'AAA', 20, CENTER, 0, false, SAMPLER, 40, 1, 1)).toEqual([]);
  });

  it('should build one continuous top polyline, one continuous bottom polyline, plus start/end caps when the selection ends are far enough apart', () => {
    // before — 10 selected "A"s (12 units advance each) span ~120 units of a ~628-unit
    // circumference, far more than the 40-unit lineHeight, so the two caps can't cross
    const content = 'A'.repeat(20);
    const edges = getCurvedSelectionEdges(ATLAS, content, 20, CENTER, 0, false, SAMPLER, 40, 0, 10);
    const outline = getCurvedSelectionOutlinePoints(ATLAS, content, 20, CENTER, 0, false, SAMPLER, 40, 0, 10);

    // result — top polyline (edges.length - 1 pairs) then bottom polyline (same), plus 4 cap points
    expect(outline).toHaveLength((edges.length - 1) * 4 + 4);
    expect(outline.slice(0, 4)).toEqual([edges[0].top, edges[1].top, edges[1].top, edges[2].top]);
    expect(outline.slice(-4)).toEqual([edges[0].top, edges[0].bottom, edges[edges.length - 1].top, edges[edges.length - 1].bottom]);
  });

  it('should omit the start/end caps when the selection ends are close enough that the caps would cross', () => {
    // before — 2 selected "A"s span only ~24 units, well under the 40-unit lineHeight, standing in
    // for the real-world case of selecting all of a curved-text node that wraps almost back to its
    // own start — either way, two perpendicular caps this close together would cross into a stray
    // zigzag instead of reading as two separate lines
    const edges = getCurvedSelectionEdges(ATLAS, 'AAA', 20, CENTER, 0, false, SAMPLER, 40, 0, 2);
    const outline = getCurvedSelectionOutlinePoints(ATLAS, 'AAA', 20, CENTER, 0, false, SAMPLER, 40, 0, 2);

    // result — just the curve segments, no trailing cap points
    expect(outline).toHaveLength((edges.length - 1) * 4);
  });
});
